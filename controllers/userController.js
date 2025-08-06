import moment from 'moment-timezone';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';



// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password -__v');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Users fetched successfully',
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ statusCode: 404, success: false ,message: 'User not found' });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, success: false,  message: 'Failed to fetch user', error: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
      const { password,  ...updateData } = req.body;

     if(password){
      return res.status(404).json({ statusCode: 404, success: false, message: "You don't have permission to reset the password" });
     }
     
    const updatedUser = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ statusCode: 404, success: false, message: 'User not found' });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, success: false, message: 'Failed to update user', error: error.message });
  }
};


export const updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;

    	const loginUserId=req.user._id
 	const loginUser = await userModel.findById(loginUserId);

    if (!password) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Password is required',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ statusCode: 404, success: false, message: 'User not found' });
    }


   return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: 'Failed to update password',
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
      console.log("deletedUser",deletedUser)

    if (!deletedUser) {
      return res.status(404).json({ statusCode: 404, success: false, message: 'User not found' });
    }

    if (!deletedUser) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({ statusCode: 200, success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ statusCode: 500,success: false,  message: 'Failed to delete user', error: error.message });
  }
};
