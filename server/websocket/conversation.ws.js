const SQL = require('sql-template-strings');
const db  = require('../../server/db');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const User    = require('../models/schemas/user');
const Message = require('../models/ws-message');

module.exports = {

  createConversation(user, data, msgId, wss, ws) {
    console.log("createConversation");

    let title = data.title === '' ? null : data.title;

    (async(function () {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await(db.pool.connect());

      try {
        await(client.query('BEGIN'));
        let res;

        // Insert the new conversation
        res = await(client.query(
          SQL`
            INSERT INTO t_conversation(title)
            VALUES (${title})
            RETURNING id
            `
        ));

        let convId = res.rows[0].id;

        // Insert new (root) thread for the conversation
        res = await(client.query(
          `INSERT INTO t_thread(fk_conversation) VALUES (${convId}) RETURNING id`
        ));

        let rootId = res.rows[0].id;

        // Update the root thread ref for the conversation
        await(client.query(
          `UPDATE t_conversation set fk_root_thread = (${rootId})`
        ));

        // Insert the new conversation for users
        for (let id of data.members) {
          await(client.query(
            SQL`
            INSERT INTO t_conversation_user(fk_conversation, fk_member)
            VALUES (${convId}, ${id})
            `
          ));
        }

        // Retrieve the list of members of the new conversation
        res = await(client.query(
          SQL`
          SELECT id u_id, login u_login, email u_email, firstname u_firstname, lastname u_lastname, profile_picture u_pp
          FROM  t_user
          WHERE id = ANY (${data.members.filter(id => id !== user.id)})
          `
        ));

        let members = [], member;
        res.rows.forEach(row => {
          member = new User(row);
          members.push(member);
        });

        await(client.query('COMMIT'));

        ws.sendJson(new Message(msgId, {convId, rootId, members}, true, 'Conversation créée avec succès'));

        // Add the new conversation to the user in ws session
        user.conversations.push(convId);

      } catch (e) {
        await(client.query('ROLLBACK'));
        throw e;
      } finally {
        client.release();
      }
    }))().catch(e => console.error(e.stack));
  }


};
