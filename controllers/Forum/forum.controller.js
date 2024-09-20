const Forum = require("../../model/Forum/Forum.model"); // Assuming Forum model is located in models folder
const NotificationModel = require("../../model/Notifications/Notification.model");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

// Controller to add a new forum
const addForum = async (req, res) => {
  try {
    const { title, description, category, tags, isPrivate } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json(new ApiError(400, "Title and description are required."));
    }

    const newForum = new Forum({
      title,
      description,
      creator: req.user.id,
      category,
      tags,
      isPrivate: isPrivate || false,
    });

    const savedForum = await newForum.save();

    const notificationToUser = new NotificationModel({
      recipient: req.user.id,
      message: `Forum post titled "${savedForum.title}" was successfully added.`,
      activityType: "FORUM_POST_ADDED",
      relatedId: savedForum._id,
    });

    await notificationToUser.save();

    return res.status(201).json(
      new ApiResponse(201, "Forum created successfully", {
        _id: savedForum._id,
        title: savedForum.title,
      })
    );
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

    const forum = await Forum.findById(forumId)
      .populate("creator", "f_Name l_Name")
      .select("-isPrivate -updatedAt");
    if (!forum) {
      return res.status(404).json(new ApiError(404, "Forum not found."));
    }

    return res.status(200).json(
      new ApiResponse(200, "Forum found.", {
        _id: forum._id,
        title: forum.title,
        description: forum.description,
        creatorId: forum.creator._id,
        creatorName: forum.creator.f_Name + " " + forum.creator.l_Name,
        tags: forum.tags,
        participants: forum.participants,
        replies: forum.replies.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
        createdAt: forum.createdAt,
      })
    );
  } catch (error) {
    console.error("Error retrieving forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

// Controller to add Comment / Reply
async function addReplyToPost(req, res) {
  const forumId = req.query.forumid;
  const userid = req.user.id;
  const replyContent = req.body.replyContent;
  const post = await Forum.findById(forumId);
  if (!post) {
    throw new Error("Post not found");
  }
  post.replies.push({
    content: replyContent,
    author: userid,
  });
  await post.save();

  const notificationToUser = new NotificationModel({
    recipient: req.user.id,
    message: `A reply was successfully added to the forum post titled "${post.title}".`,
    activityType: "FORUM_REPLY_ADDED",
    relatedId: post._id,
  });
  await notificationToUser.save();
  res.send("commented");
}

module.exports = {
  addForum,
  getForumById,
  addReplyToPost,
};
