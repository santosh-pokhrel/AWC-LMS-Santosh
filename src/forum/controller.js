import { forumMapper } from "../utils/helper.js";
import { tributObj } from "../utils/helper.js";
import { contactMapper } from "../utils/helper.js";

export class ForumController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentAuthorId = "90";
    }

    async init() {
        this.model.onData((records) => {
            const mapped = forumMapper(records);
            this.view.renderPosts(mapped);
        });
        await this.model.init();
        this.wireEvents();
        this.tributeHandler();
    }

    async tributeHandler() {
        let records = await this.model.fetchContacts();
        let mapped = contactMapper(Object.values(records));
        let tribute = new Tribute(tributObj);
        tribute.collection[0].values = mapped;
        tribute.attach(document.getElementById("post-data"));

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
                alert("Failed to create post");
            }
        });

        this.view.onUpvote(async (postId) => {
            let voteId = document.querySelector(`[data-action="upvote"][data-post-id="${postId}"]`).getAttribute("data-vote-id");
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
                this.view.applyUpvoteStyles(postId, '')
            }

        });

        this.view.onCommentButtonClicked(async (postId) =>{
            let voteId = document.querySelector(`[data-action="toggle-comment"][data-post-id="${postId}"]`)
            if(!voteId){
                alert("Couldn't found an element");
            }else{
                let el = document.querySelector(`.commentForm#commentForm_${postId}`)
                this.view.toggleCreateForumSection(el);
            }
        })

        

        this.view.onDeleteRequest(async (postId) => {
            try {
                const res = await this.model.deletePostById(postId);
                if (!res.isCancelling) {
                    this.view.removePostNode(postId);
                } else {
                    alert("Delete failed");
                }
            } catch {
                alert("Delete failed");
            }
        });
    }


}
