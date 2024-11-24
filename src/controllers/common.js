import { countUsers}  from '../services/common.js'

export const getStartUserCountController = async (_req, res) => {
  const totalUser =  await countUsers();

  res.json({
    status: 200,
    message: `Number of users in the database ${totalUser} !`,
    totalUser: totalUser,
  });
}
