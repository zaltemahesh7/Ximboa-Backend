const Forum = require("../../model/Forum/Forum.model"); // Assuming Forum model is located in models folder
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

// Controller to add a new forum
const addForum = async (req, res) => {
  try {
    const { title, description, tags, isPrivate } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json(new ApiError(400, "Title and description are required."));
    }

    const newForum = new Forum({
      title,
      description,
      creator: req.user.id,
      tags,
      isPrivate: isPrivate || false,
    });

    const savedForum = await newForum.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Forum created successfully", savedForum));
  } catch (error) {
    console.error("Error creating forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

// Controller to get a forum by ID
const getForumById = async (req, res) => {
  try {
    const forumId = req.params.id;

    const forum = await Forum.findById(forumId).populate(
      "creator",
      "f_Name l_Name"
    ).select("-isPrivate -updatedAt")
    if (!forum) {
      return res.status(404).json(new ApiError(404, "Forum not found."));
    }

    return res.status(200).json(new ApiResponse(200, "Forum found.", forum));
  } catch (error) {
    console.error("Error retrieving forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

module.exports = {
  addForum,
  getForumById,
};
