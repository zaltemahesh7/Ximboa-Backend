const Registration = require('../../model/registration')

const getAllAdmins = async (req, res) => {
  try {
    const users = await Registration.find({ role: 'ADMIN' });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get an admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Registration.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin", error });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
};
