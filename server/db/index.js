const {Pool} = require('pg');

const pool = new Pool({
  user:     'chattree',
  host:     'localhost',
  database: 'chattree',
  password: 'etajvbis',
  port:     5432
});

module.exports = {
  query: (text, callback) => {
    const start = Date.now();
    return pool.query(text, (err, res) => {
      if (err) throw err;
      const duration = Date.now() - start;
      console.log('query : ', text.strings
        .slice(0, -1)
        .map((frag, i) => frag + text.values[i])
        .join('')
        .concat(text.strings[text.strings.length-1]));
      console.log(`executed in ${duration}ms, ${res.rowCount} rows retrieved`);
      callback(err, res);
    });
  },

  pool: pool
};
