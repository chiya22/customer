
const returnvalue = function (value) {
  return (value ? '"' + value + '"' : null);
};

const getToday = function() {
  const d = new Date();
  let mm = ('00' + (d.getMonth() + 1)).slice(-2);
  let dd = ('00' + d.getDate()).slice(-2);
  return d.getFullYear() + mm + dd;
}

module.exports = {
  returnvalue,
  getToday,
};