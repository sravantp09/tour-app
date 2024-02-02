const fs = require('fs');

const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8'),
);

function getAllUsers(req, res) {
  if (!usersData || usersData.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'no data found',
    });
  }
  return res.status(200).json({
    status: 'success',
    data: {
      users: usersData,
    },
  });
}

module.exports = {
  getAllUsers,
};
