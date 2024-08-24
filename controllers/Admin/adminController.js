// controllers/adminController.js

const Admin = require("../../model/AdminModels/admin");

// Create a new admin
const createAdmin = async (req, res) => {
  try {
    const {
      profile,
      f_name,
      l_name,
      email,
      password,
      mobile_no,
      whatsapp_no,
      date_of_birth,
      address_1,
      address_2,
      city,
      state,
      pincode,
      country,
    } = req.body;

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new admin
    const newAdmin = new Admin({
      profile,
      f_name,
      l_name,
      email,
      password,
      mobile_no,
      whatsapp_no,
      date_of_birth,
      address_1,
      address_2,
      city,
      state,
      pincode,
      country,
    });

    // Save the admin to the database
    const savedAdmin = await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: savedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating admin", error });
  }
};

// Get a list of all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

// Get an admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
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
  createAdmin,
  getAllAdmins,
  getAdminById,
};
