import { forumMapper } from "../utils/helper.js";
import { tributObj } from "../utils/helper.js";
import { contactMapper } from "../utils/helper.js";
import { showLoader } from "../utils/helper.js";
import { hideLoader } from "../utils/helper.js";

export class ForumController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentAuthorId = "90";
    }

    async init() {
        try {
            this.model.onData((records) => {
                try {
                    const mapped = forumMapper(records);
                    this.view.renderPosts(mapped);
                } catch (err) {
                    console.error("Error mapping/rendering posts:", err);
                }
            });
            await this.model.init();
            this.wireEvents();
            await this.tributeHandler();
        } catch (err) {
            console.error("Error initializing ForumController:", err);
        }finally{
           hideLoader();
        }
    }

    async tributeHandler() {
        try {
            let records = await this.model.fetchContacts();
            let mapped = contactMapper(Object.values(records));
            let tribute = new Tribute(tributObj);
            tribute.collection[0].values = mapped;
            tribute.attach(document.getElementById("post-data"));

            document.addEventListener("focusin", (e) => {
                try {
                    const t = e.target;
                    if (!t || t.getAttribute("contenteditable") !== "true") return;
                    if (t.matches(".post-input")) {
                        tribute.attach(t);
                    }
                } catch (err) {
                    console.error("Error attaching tribute:", err);
                }
            });
        } catch (err) {
            console.error("Error initializing tribute:", err);
        }
    }

    wireEvents() {
        this.view.onCreatePost(async ({ copy, fileMeta }) => {
            if (!copy) return alert("Please write something before posting.");
            try {
                const result = await this.model.createPost({ authorId: this.currentAuthorId, copy, fileMeta });
                if (result?.isCancelling) {
                    alert("Error while cancelling the records");
                    return;
                }
                alert("New post created");
                this.view.removeFieldData();
            } catch (err) {
                console.error("Error creating post:", err);
                alert("Failed to create post");
            }
        });

        this.view.onUpvote(async (payload) => {
            try {
                let { type, postId, commentId } = payload;

                if (type == "post") {
                    let btn = document.querySelector(`[data-action="upvote-post"][data-post-id="${postId}"]`);
                    if (!btn) throw new Error("Post upvote element not found");
                    let voteId = btn.getAttribute("data-vote-id");

                    if (!voteId) {
                        let result = await this.model.createVote({ "Forum_Reactor_ID": this.currentAuthorId, "Reacted_to_Forum_ID": postId });
                        if (result?.isCancelling) {
                            alert("Error while voting the record");
                            return;
                        }
                        alert("Post has been voted");
                        this.view.applyUpvoteStyles(postId, voteId);
                    } else {
                        let result = await this.model.deleteVote(voteId);
                        if (result.isCancelling) {
                            alert("Error while deleting the vote of the record");
                            return;
                        }
                        this.view.applyUpvoteStyles(postId, '');
                    }
                }
                else if (type == "comment") {
                    let btn = document.querySelector(`[data-action="upvote-comment"][data-comment-id="${commentId}"]`);
                    if (!btn) throw new Error("Comment upvote element not found");
                    let voteId = btn.getAttribute("data-vote-id");

                    if (!voteId) {
                        let result = await this.model.createCommentUpvote(commentId, this.currentAuthorId);
                        if (result?.isCancelling) {
                            alert("Error while voting the record");
                            return;
                        }
                        alert("Post has been voted");
                        this.view.applyUpvoteStyles(postId, voteId);
                    } else {
                        let result = await this.model.deleteCommentUpvote(Number(voteId));
                        if (result?.isCancelling) {
                            alert("Error while voting the comment");
                            return;
                        }
                        alert("upvote has been removed");
                    }
                }
                else if (type == "reply") {
                    let btn = document.querySelector(`[data-action="upvote-reply"][data-reply-id="${commentId}"]`);
                    if (!btn) throw new Error("Reply upvote element not found");
                    let voteId = btn.getAttribute("data-vote-id");

                    if (!voteId) {
                        let result = await this.model.createCommentUpvote(commentId, this.currentAuthorId);
                        if (result?.isCancelling) {
                            alert("Error while voting the record");
                            return;
                        }
                        alert("Post has been voted");
                        this.view.applyUpvoteStyles(postId, voteId);
                    } else {
                        let result = await this.model.deleteCommentUpvote(Number(voteId));
                        if (result?.isCancelling) {
                            alert("Error while voting the comment");
                            return;
                        }
                        alert("upvote has been removed");
                    }
                }
            } catch (err) {
                console.error("Error handling upvote:", err);
                alert("Upvote action failed");
            }
        });

        this.view.onCommentButtonClicked(async (postId) => {
            try {
                let cmtEl = document.querySelector(`[data-action="toggle-comment"][data-post-id="${postId}"]`);
                if (!cmtEl) {
                    alert("Couldn't find comment toggle element");
                } else {
                    let el = document.querySelector(`.commentForm#commentForm_${postId}`);
                    this.view.toggleCreateForumSection(el);
                }
            } catch (err) {
                console.error("Error toggling comment form:", err);
            }
        });

        this.view.onDeleteRequest(async (payload) => {
            let { commentId, postId, type } = payload;
            try {
                if (type == "comment") {
                    const res = await this.model.deleteComment(commentId);
                    if (!res.isCancelling) {
                        alert("comment has been deleted");
                        this.view.removePostNode(commentId);
                    } else {
                        alert("Delete failed");
                    }
                }
                if (type == "post") {
                    const res = await this.model.deletePostById(postId);
                    if (!res.isCancelling) {
                        this.view.removePostNode(postId);
                    } else {
                        alert("Delete failed");
                    }
                }
            } catch (err) {
                console.error("Error deleting:", err);
                alert("Delete failed");
            }
        });

        this.view.onReplyButtonClicked(async (commentId) => {
            try {
                let replyEl = document.querySelector(`[data-action="toggle-reply"][data-comment-id="${commentId}"]`);
                if (!replyEl) {
                    alert("Couldn't find reply toggle element");
                } else {
                    let el = document.querySelector(`.ReplyForm#replyForm_${commentId}`);
                    this.view.toggleCreateForumSection(el);
                }
            } catch (err) {
                console.error("Error toggling reply form:", err);
            }
        });

        this.view.getCommentValueObj(async (payload, editor) => {
            try {
                payload.authorId = this.currentAuthorId;
                let result = await this.model.createComment(payload);
                if (!result.isCancelling) {
                    alert("New comment has been created");
                } else {
                    alert("Comment creation failed");
                }
            } catch (err) {
                console.error("Error creating comment:", err);
                alert("Comment creation failed");
            }
        });

        this.view.getReplyValueObj(async (payload, editor) => {
            try {
                payload.authorId = this.currentAuthorId;
                let result = await this.model.createReplyToComment(payload);
                if (!result.isCancelling) {
                    alert("New Reply has been created");
                    document.getElementById(`replyForm_${payload.commentId}`).style.setProperty("display", "none");
                } else {
                    alert("Reply failed");
                }
            } catch (err) {
                console.error("Error creating reply:", err);
                alert("Reply failed");
            }
        });
    }
}
