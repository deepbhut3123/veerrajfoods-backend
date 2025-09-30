const User = require("../models/usermodel");
const bcrypt = require('bcrypt');
// const Role = require("../../models/RoleModel");
const jwt = require("jsonwebtoken");
// const RolesPermissionsModel = require("../../models/RolesPermissionsModel");
const moment = require('moment-timezone');
// const AttendanceSchema = require("../../models/AttendanceModel");
// const UserModel = require("../../models/UserModel");
// const HolidayModel = require("../../models/HolidayModel");
// const LeaveModel = require("../../models/LeaveModel");
// const RoleSchema = require("../../models/RoleModel");

const jwtKey = "jwttoken"; // Make sure to use an environment variable for this in production

const userController = {
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Login attempt for e-mail:", email);
            // const requestIp = req.ip.replace('::ffff:', ''); // Normalize IP
            //                 console.log("Request IP:", requestIp);
            //            if (employeeId.toUpperCase() !== 'E100') {
            //   if (
            //     !requestIp.startsWith("192.168.1.") &&
            //     !requestIp == "127.0.0.1"
            //   ) {
            //     return res.status(401).json({ error: "Login not allowed from this IP address" });
            //   }
            // }


            // Find user
            const user = await User.findOne({
                email: new RegExp(`^${email}$`, 'i')
            });

            if (!user) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid employeeId or password" });
            }

            // Find user's permissions
            // const rolePermissions = await RolesPermissionsModel.findOne({
            //     roleId: user.roleId._id,
            //     isActive: true,
            //     isDeleted: false
            // }).populate("permissions.menuId"); // populate menu details if needed

            // Generate JWT Token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                jwtKey,
                { expiresIn: "8h" }
            );

            res.json({
                message: "Login successful",
                token,
                user,
                // permissions: rolePermissions ? rolePermissions.permissions : []  // send empty if not found
            });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: error });
        }
    },

    register: async (req, res) => {
        try {
            const { email, name, password, mobileNo } = req.body;

            if (!name || name.trim() === "") {
                return res.status(400).json({ error: "Name is required" });
            }

            // Password Hashing
            const hashedPassword = await bcrypt.hash(password, 10);

            // // ✅ Role ko `ObjectId` se fetch karna
            // let assignedRole = null;
            // let roleName = "";

            // if (roleId) {
            //     assignedRole = await Role.findOne({ roleId }); // roleId se Role find karna
            // } else {
            //     assignedRole = await Role.findOne({ name: "Developer" });
            // }

            // if (!assignedRole) {
            //     return res.status(400).json({ error: "Invalid Role" });
            // }

            // roleName = assignedRole.name;

            // ✅ User creation
            const user = new User({
                email,
                name,
                password: hashedPassword,
                // roleId: assignedRole._id, // Store ObjectId of Role
                mobileNo
            });
            await user.save();

            res.status(201).json({
                message: "User created successfully",
            });

        } catch (error) {
            console.error("Registration Error:", error);
            res.status(500).json({ error: error.message });
        }
    },



    // getsingleUser: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const user = await User.findById(userId).populate("roleId");
    //         if (!user) {
    //             return res.status(404).json({ error: "User not found" });
    //         }
    //         res.json(user);
    //     } catch (error) {
    //         console.error("Error retrieving user:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },
    // //  user comming in all reporters in full detail
    // getAllUsers: async (req, res) => {
    //     try {
    //         const page = parseInt(req.query.page) || 1;
    //         const limit = parseInt(req.query.limit) || 10;
    //         const skip = (page - 1) * limit;

    //         // Fetch all users with roleId populated
    //         const users = await User.find()
    //             .populate({
    //                 path: "roleId",
    //                 match: { roleId: 2 }, // केवल Reporter Role वाले
    //             })
    //             .skip(skip)
    //             .sort({ employeeId: 1 })
    //             .limit(limit);

    //         // Remove users whose populated roleId is null
    //         const filteredUsers = users.filter(user => user.roleId !== null);

    //         // Total count of users with roleId: 2 (for accurate pagination)
    //         const total = await User.countDocuments({}); // This includes all users
    //         const totalFiltered = (await User.find()
    //             .populate({
    //                 path: "roleId",
    //                 match: { roleId: 2 },
    //             })).filter(user => user.roleId !== null).length;

    //         res.status(200).json({
    //             success: true,
    //             count: filteredUsers.length,
    //             total: totalFiltered,
    //             page,
    //             totalPages: Math.ceil(totalFiltered / limit),
    //             data: filteredUsers
    //         });
    //     } catch (error) {
    //         console.error("Error retrieving users:", error);
    //         res.status(500).json({ success: false, error: "Internal Server Error" });
    //     }
    // },
    // updateUser: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const { email, username, password, roleId } = req.body;
    //         const user = await User.findByIdAndUpdate(userId, { email, username, password, roleId }, { new: true });
    //         if (!user) {
    //             return res.status(404).json({ error: "User not found" });
    //         }
    //         res.json(user);
    //     } catch (error) {
    //         console.error("Error updating user:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },
    // deleteUser: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const user = await User.findByIdAndDelete(userId);
    //         if (!user) {
    //             return res.status(404).json({ error: "User not found" });
    //         }
    //         res.json({ message: "User deleted successfully" });
    //     } catch (error) {
    //         console.error("Error deleting user:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },
    // profileUpdate: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const { email, username, password, roleId } = req.body;
    //         const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    //         if (!user) {
    //             return res.status(404).json({ error: "User not found" });
    //         }
    //         res.json(user);
    //     } catch (error) {
    //         console.error("Error updating user:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },
    // update: async (req, res) => {
    //     try {
    //         const userData = { ...req.body };
    //         // console.log("userData", userData);

    //         if (!userData._id) {
    //             return res.status(400).json({ error: "User ID is required" });
    //         }

    //         const existingUser = await User.findById(userData._id);
    //         if (!existingUser) {
    //             return res.status(404).json({ error: "User not found" });
    //         }

    //         // Handle image upload
    //         if (req.file) {
    //             const filename = req.file.filename;
    //             // console.log("Uploaded image:", filename);
    //             userData.photo = filename;
    //         }

    //         // Handle password update
    //         if (userData.currentPassword && userData.newPassword) {
    //             const isMatch = await bcrypt.compare(userData.currentPassword, existingUser.password);

    //             if (!isMatch) {
    //                 return res.status(400).json({ error: "Current password is incorrect" });
    //             }

    //             const salt = await bcrypt.genSalt(10);
    //             const hashedNewPassword = await bcrypt.hash(userData.newPassword, salt);
    //             userData.password = hashedNewPassword;
    //         }

    //         // Remove sensitive fields you don't want to update directly
    //         delete userData.currentPassword;
    //         delete userData.newPassword;

    //         // Update the user
    //         const updatedUser = await User.findByIdAndUpdate(userData._id, userData, {
    //             new: true,
    //         });

    //         if (updatedUser) {
    //             return res.json({
    //                 message: "User updated successfully.",
    //                 updatedUser,
    //             });
    //         } else {
    //             return res.status(404).json({ error: "User not found after update" });
    //         }
    //     } catch (error) {
    //         // console.error("Update Error:", error);
    //         res.status(500).json({ error: error.message });
    //     }
    // },
    // getUserProfile: async (req, res) => {
    //     try {
    //         // console.log("req.user._id", req.user._id);
    //         const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).populate("designation").select('-password');
    //         if (!user) {
    //             return res.status(404).json({ error: "User not found" });
    //         }
    //         res.json(user);
    //     } catch (error) {
    //         console.error("Error updating user:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },
};

module.exports = userController;
