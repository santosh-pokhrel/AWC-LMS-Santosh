import { uploadAndGetFileLink } from '../utils/upload.js';

// export class ForumView {
//     constructor({ mountId, modalRootId, postTextareaId, postButtonId }) {
//         this.mount = document.getElementById(mountId);
//         this.modalRootId = modalRootId;
//         this.postTextarea = document.getElementById(postTextareaId);
//         this.postButton = document.getElementById(postButtonId);
//         this.autoResizePostTextarea();

//     }

//     // -------- Rendering --------
//     renderPosts(records) {
//         this.registerTemplates(records);
//     }

//     // -------- Event Binding APIs (controller provides handlers) --------
//     onCreatePost(handler) {
//         if (!this.postButton) return;
//         this.postButton.addEventListener("click", (e) => {
//             e.preventDefault();
//             const copy = (this.postTextarea?.value ?? "").trim();
//             handler?.({ copy });
//         });
//     }

//     onUpvote(handler) {
//         this.mount.addEventListener("click", (e) => {
//             const el = e.target.closest("[data-action='upvote']");
//             if (!el) return;
//             const postId = el.dataset.postId;
//             handler?.(postId);
//         });
//     }

//     onDeleteRequest(handler) {
//         this.mount.addEventListener("click", (e) => {
//             const btn = e.target.closest("[data-action='delete-request']");
//             if (!btn) return;
//             const postId = btn.dataset.postId;
//             this.openDeleteModal({
//                 onConfirm: () => handler?.(postId),
//             });
//         });
//     }

//     // -------- View-only effects --------
//     applyUpvoteStyles(postId) {
//         const el = this.mount.querySelector(`[data-action='upvote'][data-post-id='${postId}']`);
//         if (!el) return;
//         el.classList.add("bg-[#007c8f]");
//         el.querySelector("svg path")?.style.setProperty("fill", "white", "important");
//         el.querySelector("p")?.style.setProperty("color", "white");
//     }

//     removePostNode(postId) {
//         const node = this.mount.querySelector(`[current-post-id='${postId}']`);
//         node?.remove();
//     }




//     openDeleteModal({ onConfirm }) {
//         // Clean up old
//         document.getElementById(this.modalRootId)?.remove();

//         const root = document.createElement("div");
//         root.id = this.modalRootId;
//         root.innerHTML = `
//       <div class="modal-backdrop" data-close="true"></div>
//       <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="deleteTitle">
//         <h5 id="deleteTitle" class="modal-title">Are you sure you want to delete?</h5>
//         <div class="delete-inner-div">
//           <button class="modal-button modal-yes" data-yes>Yes</button>
//           <button class="modal-button modal-no" data-no>No</button>
//         </div>
//       </div>`;

//         document.body.appendChild(root);
//         document.body.style.overflow = "hidden";

//         const close = () => {
//             root.remove();
//             document.body.style.overflow = "";
//         };

//         root.addEventListener("click", (e) => {
//             if (e.target?.dataset?.close !== undefined) close();
//         });
//         root.querySelector("[data-no]")?.addEventListener("click", close);
//         root.querySelector("[data-yes]")?.addEventListener("click", async () => {
//             try {
//                 await onConfirm?.();
//             } finally {
//                 close();
//             }
//         });
//         root.querySelector("[data-yes]")?.focus();
//     }

//     autoResizePostTextarea() {
//         if (!this.postTextarea) return;
//         const el = this.postTextarea;
//         const resize = function () {
//             this.style.height = "auto";
//             this.style.height = this.scrollHeight + "px";
//         };
//         el.addEventListener("input", resize);
//         // Trigger once on load for initial content
//         resize.call(el);
//     }

//     removeFieldData(){
//       let element = document.getElementById("post-data")
//       if(element){
//         element.value = ""
//       }else{
//         console.log("Cannot find Element");
//       }
//     }
// }


export class ForumView {
  constructor({ mountId, modalRootId, postTextareaId, postButtonId, model }) {
    this.mount = document.getElementById(mountId);
    this.modalRootId = modalRootId;
    this.postTextarea = document.getElementById(postTextareaId);
    this.postButton = document.getElementById(postButtonId);
    this.templateName = "PostTemplate";
    this.ensureTemplate();
    this.autoResizePostTextarea();
    this.model = model;
    this.mount.addEventListener("click", (e) => {
      const t = e.target.closest(".actionToggleButton");
      if (!t) return;
      const w = t.querySelector(".actionItemsWrapper");
      if (w) w.classList.toggle("hidden");
    });
    this.getCommentValueObj();
    this.getReplyValueObj();
    this.initCommentReplyToggles();
  }

  ensureTemplate() {
    const template = `
  <div current-post-id="{{:postId}}" class="relative bg-white rounded p-3 mb-4 postCard border border-[#F2F2F2]">

    {{if canDelete}}
      <div class="cursor-pointer actionToggleButton relative w-max ml-auto">
        <!-- kebab -->
        <svg width="20" height="20" viewBox="0 0 4 14" xmlns="http://www.w3.org/2000/svg" class="fill-[#414042]">
          <path d="M3.45679 6.99992C3.45679 7.34176 3.35542 7.67593 3.1655 7.96016C2.97558 8.2444 2.70565 8.46593 2.38982 8.59675C2.074 8.72757 1.72648 8.76179 1.3912 8.6951C1.05593 8.62841 0.747957 8.4638 0.506236 8.22208C0.264516 7.98036 0.0999019 7.67239 0.0332114 7.33711C-0.0334791 7.00184 0.000748884 6.65431 0.131567 6.33849C0.262385 6.02267 0.483918 5.75273 0.768151 5.56281C1.05238 5.37289 1.38655 5.27152 1.7284 5.27152C2.18679 5.27152 2.62642 5.45362 2.95056 5.77776C3.27469 6.1019 3.45679 6.54152 3.45679 6.99992Z"/>
          <path d="M1.7284 3.79C2.07024 3.79 2.40441 3.68867 2.68864 3.49876C2.97287 3.30884 3.19441 3.0389 3.32522 2.72308C3.45604 2.40725 3.49027 2.05973 3.42358 1.72445C3.35689 1.38918 3.19228 1.08121 2.95056 0.839488C2.70884 0.597768 2.40086 0.433154 2.06559 0.366463C1.73031 0.299773 1.38279 0.334001 1.06697 0.464819C0.751145 0.595637 0.481206 0.81717 0.291288 1.1014C0.101369 1.38564 0 1.7198 0 2.06165C0 2.52 0.182099 2.95967 0.506236 3.28381C0.830373 3.60794 1.27 3.79 1.7284 3.79Z"/>
          <path d="M1.7284 10.21C1.38655 10.21 1.05238 10.3112 0.768151 10.5011C0.483918 10.691 0.262385 10.9609 0.131567 11.2768C0.000748884 11.5926 -0.0334791 11.9401 0.0332114 12.2754C0.0999019 12.6107 0.264516 12.9186 0.506236 13.16C0.747957 13.4021 1.05593 13.5667 1.3912 13.6334C1.72648 13.7001 2.074 13.6658 2.38982 13.535C2.70565 13.4042 2.97558 13.1827 3.1655 12.8984C3.35542 12.6142 3.45679 12.28 3.45679 11.9382C3.45679 11.48 3.27469 11.04 2.95056 10.716C2.62642 10.3919 2.18679 10.21 1.7284 10.21Z"/>
        </svg>
        <div class="actionItemsWrapper shadow-lg absolute top-[1rem] right-0 flex flex-col gap-3 p-2 bg-white w-max hidden">
          <button type="button" class="deletePostButton text-red-500 hover:text-red-700 focus:outline-none"
                  data-action="delete-request" data-post-id="{{:postId}}">
            Delete
          </button>
        </div>
      </div>
    {{/if}}

    <!-- POST HEADER -->
    <div class="flex items-center gap-4">
      <img class="w-6 h-6 rounded-full border border-[#d3d3d3]" src="{{:avatar || 'https://i.ontraport.com/265848.fef288b2e2a570a362d1141a783309d8.JPEG'}}">
      <div class="flex items-center gap-4">
        <div class="text-[#414042] button max-[600px]:tracking-[0.86px] line-clamp-1">{{:author}}</div>
        <div class="py-1.5 px-3 bg-[#c7e6e6] rounded-[36px] font-[400] text-[12px] text-[#414042] line-clamp-1">{{:designation}}</div>
        <div class="w-[2px] h-[15px] bg-[#bbbcbb] max-[600px]:hidden"></div>
        <div class="text-[#586a80] small-text line-clamp-1">{{:published_days_ago}}</div>
      </div>
    </div>

    <!-- POST BODY -->
    <div class="my-2 content-container">
      {{:copy}}
    </div>

    <!-- POST ACTIONS -->
    <div class="flex items-center gap-4">
      <button class="roundedButton {{:voteId ? 'is-voted' : ''}}"
              data-action="upvote-post" data-post-id="{{:postId}}" data-vote-id="{{:voteId}}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="{{:voteId ? 'white' : '#007C8F'}}" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.3092 5.81653C14.1751 5.66459 14.0103 5.54291 13.8255 5.45958C13.6408 5.37625 13.4405 5.33318 13.2378 5.33322H9.90462V4.38087C9.90462 3.74942 9.65378 3.14384 9.20728 2.69734C8.76079 2.25084 8.1552 2 7.52376 2C7.43529 1.99994 7.34856 2.02452 7.27329 2.07099C7.19801 2.11746 7.13717 2.18397 7.09758 2.26309L4.84885 6.76174H2.28584C2.03327 6.76174 1.79103 6.86207 1.61243 7.04067C1.43383 7.21927 1.3335 7.46151 1.3335 7.71409V12.952C1.3335 13.2046 1.43383 13.4468 1.61243 13.6254C1.79103 13.804 2.03327 13.9043 2.28584 13.9043H12.5236C12.8716 13.9045 13.2077 13.7775 13.4688 13.5474C13.7298 13.3172 13.8979 12.9997 13.9414 12.6544L14.6557 6.9403C14.681 6.73913 14.6632 6.53488 14.6034 6.34112C14.5437 6.14736 14.4434 5.96854 14.3092 5.81653ZM2.28584 7.71409H4.66671V12.952H2.28584V7.71409Z"/>
        </svg>
        <p class="text-label vote-count">{{:voteCount}}</p>
      </button>

      <div class="text-[#007b8e] text-label cursor-pointer" data-action="toggle-comment" data-post-id="{{:postId}}">
        Comment
      </div>
    </div>

    <!-- COMMENTS WRAPPER (per post) -->
    <div class="flex items-center gap-x-3 my-2" id="comments-{{:postId}}">
      {{if Comment && Comment.length}}
              <div class="h-[1px] w-full bg-[#bbbcbb]"></div>
              <div class="label flex items-center gap-x-2 cursor-pointer" ">
                <span class="label whitespace-nowrap text-[#007c8f]">{{:Comment.length}} Comments</span>
                <span class="transition-transform duration-300 inline-block rotate-180">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8668 4.27635L6.32157 8.82158C6.27936 8.86383 6.22923 8.89736 6.17405 8.92023C6.11888 8.94311 6.05973 8.95488 6 8.95488C5.94027 8.95488 5.88112 8.94311 5.82594 8.92023C5.77077 8.89736 5.72064 8.86383 5.67842 8.82158L1.1332 4.27635C1.04791 4.19106 1 4.07539 1 3.95478C1 3.83416 1.04791 3.71849 1.1332 3.6332C1.21849 3.54791 1.33416 3.5 1.45478 3.5C1.57539 3.5 1.69106 3.54791 1.77635 3.6332L6 7.85742L10.2236 3.6332C10.2659 3.59097 10.316 3.55747 10.3712 3.53462C10.4264 3.51176 10.4855 3.5 10.5452 3.5C10.6049 3.5 10.6641 3.51176 10.7193 3.53462C10.7744 3.55747 10.8246 3.59097 10.8668 3.6332C10.909 3.67543 10.9425 3.72556 10.9654 3.78074C10.9882 3.83592 11 3.89505 11 3.95478C11 4.0145 10.9882 4.07363 10.9654 4.12881C10.9425 4.18399 10.909 4.23412 10.8668 4.27635Z" fill="#007C8F"/>
                  </svg>
                </span>
              </div>
              <div class="h-[1px] w-full bg-[#bbbcbb]"></div>
            </div>


        <!-- Each comment -->
        {{for Comment}}
          <div id="{{:id}}" current-post-id="{{:#data.id}}" class="ml-3 mt-2 p-2 border-l-[1px] border-[#007c8f] commentCard">

            <div class="cursor-pointer actionToggleButton relative w-max ml-auto">
              <svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.45679 6.99992C3.45679 7.34176 3.35542 7.67593 3.1655 7.96016C2.97558 8.2444 2.70565 8.46593 2.38982 8.59675C2.074 8.72757 1.72648 8.76179 1.3912 8.6951C1.05593 8.62841 0.747957 8.4638 0.506236 8.22208C0.264516 7.98036 0.0999019 7.67239 0.0332114 7.33711C-0.0334791 7.00184 0.000748884 6.65431 0.131567 6.33849C0.262385 6.02267 0.483918 5.75273 0.768151 5.56281C1.05238 5.37289 1.38655 5.27152 1.7284 5.27152C2.18679 5.27152 2.62642 5.45362 2.95056 5.77776C3.27469 6.1019 3.45679 6.54152 3.45679 6.99992Z" fill="#414042"/>
                <path d="M1.7284 3.79C2.07024 3.79 2.40441 3.68867 2.68864 3.49876C2.97287 3.30884 3.19441 3.0389 3.32522 2.72308C3.45604 2.40725 3.49027 2.05973 3.42358 1.72445C3.35689 1.38918 3.19228 1.08121 2.95056 0.839488C2.70884 0.597768 2.40086 0.433154 2.06559 0.366463C1.73031 0.299773 1.38279 0.334001 1.06697 0.464819C0.751145 0.595637 0.481206 0.81717 0.291288 1.1014C0.101369 1.38564 0 1.7198 0 2.06165C0 2.52 0.182099 2.95967 0.506236 3.28381C0.830373 3.60794 1.27 3.79 1.7284 3.79Z" fill="#414042"/>
                <path d="M1.7284 10.21C1.38655 10.21 1.05238 10.3112 0.768151 10.5011C0.483918 10.691 0.262385 10.9609 0.131567 11.2768C0.000748884 11.5926 -0.0334791 11.9401 0.0332114 12.2754C0.0999019 12.6107 0.264516 12.9186 0.506236 13.16C0.747957 13.4021 1.05593 13.5667 1.3912 13.6334C1.72648 13.7001 2.074 13.6658 2.38982 13.535C2.70565 13.4042 2.97558 13.1827 3.1655 12.8984C3.35542 12.6142 3.45679 12.28 3.45679 11.9382C3.45679 11.48 3.27469 11.04 2.95056 10.716C2.62642 10.3919 2.18679 10.21 1.7284 10.21Z" fill="#414042"/>
              </svg>
              <div class="actionItemsWrapper shadow-lg absolute top-[1rem] right-0 flex flex-col gap-3 p-2 bg-white w-max hidden" id="commentDelete-{{:id}}">
                <button class="text-red-500 hover:text-red-700 focus:outline-none deleteCommentButton" data-action="delete-comment-request" data-comment-id="{{:id}}">Delete</button>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <img class="w-6 h-6 rounded-full border border-[#d3d3d3]" src="{{:avatar || 'https://i.ontraport.com/265848.fef288b2e2a570a362d1141a783309d8.JPEG'}}">
              <div class="flex items-center gap-4">
                <div class="text-[#414042] button max-[600px]:tracking-[0.86px] line-clamp-1">{{:author}}</div>
                {{if designation}}
                  <div class="py-1.5 px-3 bg-[#c7e6e6] rounded-[36px] font-400 text-[12px] text-dark line-clamp-1">{{:designation}}</div>
                {{/if}}
                <div class="w-[2px] h-[15px] bg-[#bbbcbb] max-[600px]:hidden"></div>
                <div class="text-[#586a80] small-text line-clamp-1">{{:published}}</div>
              </div>
            </div>

            <div class="my-2 content-container">
              {{:comment}}
            </div>

            <div class="flex items-center gap-4">
              <button class="roundedButton {{:voteId ? 'is-voted' : ''}}" data-action="upvote-comment" data-comment-id="{{:id}}" data-vote-id="{{:#data.voteId}}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#007C8F" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.3092 5.81653C14.1751 5.66459 14.0103 5.54291 13.8255 5.45958C13.6408 5.37625 13.4405 5.33318 13.2378 5.33322H9.90462V4.38087C9.90462 3.74942 9.65378 3.14384 9.20728 2.69734C8.76079 2.25084 8.1552 2 7.52376 2C7.43529 1.99994 7.34856 2.02452 7.27329 2.07099C7.19801 2.11746 7.13717 2.18397 7.09758 2.26309L4.84885 6.76174H2.28584C2.03327 6.76174 1.79103 6.86207 1.61243 7.04067C1.43383 7.21927 1.3335 7.46151 1.3335 7.71409V12.952C1.3335 13.2046 1.43383 13.4468 1.61243 13.6254C1.79103 13.804 2.03327 13.9043 2.28584 13.9043H12.5236C12.8716 13.9045 13.2077 13.7775 13.4688 13.5474C13.7298 13.3172 13.8979 12.9997 13.9414 12.6544L14.6557 6.9403C14.681 6.73913 14.6632 6.53488 14.6034 6.34112C14.5437 6.14736 14.4434 5.96854 14.3092 5.81653ZM2.28584 7.71409H4.66671V12.952H2.28584V7.71409Z"/>
                </svg>
                <div class="text-label vote-count">{{:voteCount}}</div>
              </button>

              <div class="text-[#007b8e] text-label cursor-pointer" data-action="toggle-reply" data-comment-id="{{:id}}">
                Reply
              </div>
            </div>

            <div class="flex items-center gap-x-3 my-2">
              <div class="h-[1px] w-full bg-[#bbbcbb]"></div>
              <div class="label flex items-center gap-x-2 cursor-pointer" ">
                <span class="label whitespace-nowrap text-[#007c8f]">{{:replies && replies.length ? replies.length : 0}} Replies</span>
                <span class="transition-transform duration-300 inline-block rotate-180">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8668 4.27635L6.32157 8.82158C6.27936 8.86383 6.22923 8.89736 6.17405 8.92023C6.11888 8.94311 6.05973 8.95488 6 8.95488C5.94027 8.95488 5.88112 8.94311 5.82594 8.92023C5.77077 8.89736 5.72064 8.86383 5.67842 8.82158L1.1332 4.27635C1.04791 4.19106 1 4.07539 1 3.95478C1 3.83416 1.04791 3.71849 1.1332 3.6332C1.21849 3.54791 1.33416 3.5 1.45478 3.5C1.57539 3.5 1.69106 3.54791 1.77635 3.6332L6 7.85742L10.2236 3.6332C10.2659 3.59097 10.316 3.55747 10.3712 3.53462C10.4264 3.51176 10.4855 3.5 10.5452 3.5C10.6049 3.5 10.6641 3.51176 10.7193 3.53462C10.7744 3.55747 10.8246 3.59097 10.8668 3.6332C10.909 3.67543 10.9425 3.72556 10.9654 3.78074C10.9882 3.83592 11 3.89505 11 3.95478C11 4.0145 10.9882 4.07363 10.9654 4.12881C10.9425 4.18399 10.909 4.23412 10.8668 4.27635Z" fill="#007C8F"/>
                  </svg>
                </span>
              </div>
              <div class="h-[1px] w-full bg-[#bbbcbb]"></div>
            </div>

            <!-- REPLIES -->
            <div id="comments-{{:id}}" class="mt-4">
              {{for replies}}
                <div id="{{:id}}" current-post-id="{{:id}}" class="ml-3 mt-2 p-2 border-l-[1px] border-[#007c8f] commentCard">
                  <div class="cursor-pointer actionToggleButton relative w-max ml-auto">
                    <svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.45679 6.99992C3.45679 7.34176 3.35542 7.67593 3.1655 7.96016C2.97558 8.2444 2.70565 8.46593 2.38982 8.59675C2.074 8.72757 1.72648 8.76179 1.3912 8.6951C1.05593 8.62841 0.747957 8.4638 0.506236 8.22208C0.264516 7.98036 0.0999019 7.67239 0.0332114 7.33711C-0.0334791 7.00184 0.000748884 6.65431 0.131567 6.33849C0.262385 6.02267 0.483918 5.75273 0.768151 5.56281C1.05238 5.37289 1.38655 5.27152 1.7284 5.27152C2.18679 5.27152 2.62642 5.45362 2.95056 5.77776C3.27469 6.1019 3.45679 6.54152 3.45679 6.99992Z" fill="#414042"/>
                      <path d="M1.7284 3.79C2.07024 3.79 2.40441 3.68867 2.68864 3.49876C2.97287 3.30884 3.19441 3.0389 3.32522 2.72308C3.45604 2.40725 3.49027 2.05973 3.42358 1.72445C3.35689 1.38918 3.19228 1.08121 2.95056 0.839488C2.70884 0.597768 2.40086 0.433154 2.06559 0.366463C1.73031 0.299773 1.38279 0.334001 1.06697 0.464819C0.751145 0.595637 0.481206 0.81717 0.291288 1.1014C0.101369 1.38564 0 1.7198 0 2.06165C0 2.52 0.182099 2.95967 0.506236 3.28381C0.830373 3.60794 1.27 3.79 1.7284 3.79Z" fill="#414042"/>
                      <path d="M1.7284 10.21C1.38655 10.21 1.05238 10.3112 0.768151 10.5011C0.483918 10.691 0.262385 10.9609 0.131567 11.2768C0.000748884 11.5926 -0.0334791 11.9401 0.0332114 12.2754C0.0999019 12.6107 0.264516 12.9186 0.506236 13.16C0.747957 13.4021 1.05593 13.5667 1.3912 13.6334C1.72648 13.7001 2.074 13.6658 2.38982 13.535C2.70565 13.4042 2.97558 13.1827 3.1655 12.8984C3.35542 12.6142 3.45679 12.28 3.45679 11.9382C3.45679 11.48 3.27469 11.04 2.95056 10.716C2.62642 10.3919 2.18679 10.21 1.7284 10.21Z" fill="#414042"/>
                    </svg>
                    <div class="actionItemsWrapper shadow-lg absolute top-[1rem] right-0 flex flex-col gap-3 p-2 bg-white w-max hidden" id="commentDelete-{{:id}}">
                      <button class="text-red-500 hover:text-red-700 focus:outline-none deleteCommentButton" data-action="delete-comment-request" data-comment-id="{{:id}}">Delete</button>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <img class="w-6 h-6 rounded-full border border-[#d3d3d3]" src="{{:avatar || 'https://i.ontraport.com/265848.fef288b2e2a570a362d1141a783309d8.JPEG'}}">
                    <div class="flex items-center gap-4">
                      <div class="text-[#414042] button max-[600px]:tracking-[0.86px] line-clamp-1">{{:author}}</div>
                      {{if designation}}
                        <div class="py-1.5 px-3 bg-[#c7e6e6] rounded-[36px] font-400 text-[12px] text-dark line-clamp-1">{{:designation}}</div>
                      {{/if}}
                      <div class="w-[2px] h-[15px] bg-[#bbbcbb] max-[600px]:hidden"></div>
                      <div class="text-[#586a80] small-text line-clamp-1">{{:published}}</div>
                    </div>
                  </div>

                  <div class="my-2 content-container">{{:reply}}</div>

                  <div class="flex items-center gap-4">
                    <button class="roundedButton {{:voteId ? 'is-voted' : ''}}" data-action="upvote-reply" data-reply-id="{{:id}}" data-vote-id="{{:#data.voteId}}">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="#007C8F" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.3092 5.81653C14.1751 5.66459 14.0103 5.54291 13.8255 5.45958C13.6408 5.37625 13.4405 5.33318 13.2378 5.33322H9.90462V4.38087C9.90462 3.74942 9.65378 3.14384 9.20728 2.69734C8.76079 2.25084 8.1552 2 7.52376 2C7.43529 1.99994 7.34856 2.02452 7.27329 2.07099C7.19801 2.11746 7.13717 2.18397 7.09758 2.26309L4.84885 6.76174H2.28584C2.03327 6.76174 1.79103 6.86207 1.61243 7.04067C1.43383 7.21927 1.3335 7.46151 1.3335 7.71409V12.952C1.3335 13.2046 1.43383 13.4468 1.61243 13.6254C1.79103 13.804 2.03327 13.9043 2.28584 13.9043H12.5236C12.8716 13.9045 13.2077 13.7775 13.4688 13.5474C13.7298 13.3172 13.8979 12.9997 13.9414 12.6544L14.6557 6.9403C14.681 6.73913 14.6632 6.53488 14.6034 6.34112C14.5437 6.14736 14.4434 5.96854 14.3092 5.81653ZM2.28584 7.71409H4.66671V12.952H2.28584V7.71409Z"/>
                      </svg>
                      <div class="text-label vote-count">{{:voteCount}}</div>
                    </button>
                  </div>
                </div>
              {{/for}}
            </div>

            <!-- REPLY FORM -->
            <div class="ReplyForm mt-4 hidden" id="replyForm_{{:id}}" data-parent-id="{{:#data.id}}" data-parent-type="comment" data-forum-post-id="{{:postId}}">
              <div class="containerForToolbar">
                <div class="flex flex-wrap items-center gap-2 bg-white border border-gray-300 rounded p-2 shadow">
                  <button class="px-2 py-1 rounded hover:bg-gray-200" title="Bold">𝐁</button>
                  <button class="px-2 py-1 rounded hover:bg-gray-200" title="Italic">𝐼</button>
                  <button class="px-2 py-1 rounded hover:bg-gray-200" title="Underline">U̲</button>
                  <button class="px-2 py-1 rounded hover:bg-gray-200" title="Add Link">🔗</button>
                </div>
              </div>
              <form class="createPost rounded-[4px] bg-[#fff] border border-[#F2F2F2] hover:border-[#007c8f] focus-within:border-[#007c8f] duration-300 openSans flex-col gap-y-3 p-4">
        <div contenteditable="true" class="reply-editor outline-none post-input editor w-full mentionable mainMention" placeholder="Reply..." data-tribute="true"></div>
        <div class="commentFilePreviewContainer mt-2"></div>
        <div class="create-post-buttons">
          <input id="postFile-{{:#data.id}}" name="postFile" type="file" class="sr-only" />
          <label for="postFile-{{:#data.id}}" class="create-post-buttons attach-file inline-flex items-center gap-2 cursor-pointer border rounded px-3 py-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0385 5.72657C10.0743 5.76228 10.1026 5.80468 10.122 5.85136C10.1413 5.89804 10.1513 5.94807 10.1513 5.9986C10.1513 6.04913 10.1413 6.09916 10.122 6.14584C10.1026 6.19252 10.0743 6.23492 10.0385 6.27063L6.09504 10.2117C5.5902 10.7165 4.90551 11 4.19161 11C3.47771 11 2.79306 10.7163 2.28828 10.2115C1.78351 9.70664 1.49995 9.02195 1.5 8.30805C1.50005 7.59415 1.78369 6.9095 2.28852 6.40472L7.05916 1.56392C7.41958 1.20312 7.90856 1.00027 8.41854 1C8.92851 0.99973 9.41771 1.20206 9.77851 1.56247C10.1393 1.92289 10.3422 2.41187 10.3424 2.92185C10.3427 3.43183 10.1404 3.92102 9.77995 4.28182L5.00835 9.12263C4.79166 9.33933 4.49775 9.46107 4.1913 9.46107C3.88484 9.46107 3.59094 9.33933 3.37425 9.12263C3.15755 8.90593 3.03581 8.61203 3.03581 8.30558C3.03581 7.99912 3.15755 7.70522 3.37425 7.48852L7.37781 3.42151C7.41288 3.3841 7.45508 3.35408 7.50193 3.33322C7.54878 3.31236 7.59932 3.30109 7.65059 3.30005C7.70186 3.29902 7.75282 3.30826 7.80047 3.32721C7.84811 3.34617 7.89149 3.37447 7.92804 3.41044C7.96458 3.44641 7.99357 3.48933 8.01328 3.53667C8.03299 3.58401 8.04304 3.63481 8.04282 3.68609C8.04261 3.73737 8.03213 3.78809 8.01202 3.83526C7.99191 3.88243 7.96257 3.92511 7.92572 3.96077L3.92167 8.0321C3.88582 8.06767 3.85733 8.10995 3.83782 8.15653C3.81831 8.2031 3.80816 8.25307 3.80796 8.30357C3.80776 8.35406 3.81751 8.40411 3.83665 8.45084C3.85579 8.49757 3.88394 8.54008 3.91951 8.57593C3.95507 8.61178 3.99735 8.64027 4.04393 8.65978C4.09051 8.67929 4.14047 8.68944 4.19097 8.68964C4.24147 8.68984 4.29151 8.68009 4.33825 8.66095C4.38498 8.64181 4.42748 8.61365 4.46333 8.57809L9.23445 3.73968C9.45114 3.52343 9.57306 3.22996 9.57338 2.92382C9.57369 2.61768 9.45238 2.32395 9.23613 2.10726C9.01988 1.89056 8.7264 1.76865 8.42026 1.76833C8.11413 1.76801 7.8204 1.88933 7.6037 2.10558L2.83403 6.94446C2.65535 7.12286 2.51355 7.3347 2.41674 7.5679C2.31993 7.80109 2.27 8.05107 2.2698 8.30357C2.2696 8.55606 2.31913 8.80612 2.41557 9.03947C2.51201 9.27282 2.65347 9.48489 2.83187 9.66357C3.01026 9.84225 3.22211 9.98404 3.4553 10.0809C3.6885 10.1777 3.93848 10.2276 4.19097 10.2278C4.44346 10.228 4.69352 10.1785 4.92687 10.082C5.16022 9.98559 5.37229 9.84413 5.55097 9.66573L9.49494 5.72465C9.5673 5.65285 9.6652 5.61272 9.76713 5.61308C9.86906 5.61344 9.96668 5.65426 10.0385 5.72657Z" fill="#007C8F"/>
            </svg>
            <span>Attach a File</span>
          </label>

          <button type="submit" class="post" id="reply-post-button" data-id="reply-post-button-{{:#data.id}}">
            <span>Post</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.4282 5.99409C10.4285 6.12138 10.3948 6.24645 10.3306 6.35635C10.2664 6.46625 10.174 6.55701 10.0629 6.61922L2.56502 10.9062C2.45742 10.9672 2.33595 10.9995 2.21227 11C2.09832 10.9994 1.98616 10.9715 1.88517 10.9187C1.78417 10.8659 1.69727 10.7898 1.63172 10.6965C1.56617 10.6033 1.52386 10.4958 1.50834 10.3829C1.49282 10.27 1.50453 10.155 1.54249 10.0476L2.74809 6.47767C2.75987 6.44277 2.78216 6.41236 2.8119 6.39062C2.84163 6.36888 2.87736 6.35686 2.9142 6.35622H6.14162C6.19059 6.35633 6.23906 6.34636 6.28402 6.32695C6.32898 6.30754 6.36946 6.27909 6.40296 6.24337C6.43646 6.20765 6.46226 6.16543 6.47875 6.11932C6.49525 6.07321 6.50208 6.0242 6.49884 5.97534C6.49074 5.88348 6.44824 5.79808 6.37985 5.73623C6.31145 5.67438 6.22222 5.64065 6.13002 5.64179H2.91509C2.87772 5.64179 2.84129 5.63008 2.81094 5.60829C2.78058 5.5865 2.75782 5.55574 2.74586 5.52034L1.54026 1.95088C1.49228 1.81406 1.48705 1.66588 1.52529 1.52603C1.56352 1.38617 1.6434 1.26126 1.75432 1.16789C1.86524 1.07451 2.00194 1.01709 2.14626 1.00326C2.29059 0.989426 2.43571 1.01983 2.56234 1.09044L10.0638 5.37209C10.1743 5.43416 10.2662 5.52447 10.3302 5.63377C10.3942 5.74307 10.4281 5.86742 10.4282 5.99409Z" fill="white"/>
            </svg>
          </button>
        </div>
      </form>
            </div>
          </div>
        {{/for}}
      {{/if}}
    </div>

    <!-- ADD COMMENT FORM (per post) -->
    <div class="mt-4 commentForm hidden" id="commentForm_{{:postId}}" data-parent-id="{{:postId}}" data-parent-type="post" data-forum-post-id="{{:postId}}">
      <div class="containerForToolbar rounded hover:bg-gray-200">
        <div class="flex flex-wrap items-center gap-2 bg-white border border-gray-300 rounded p-2 shadow">
          <button class="px-2 py-1 rounded hover:bg-gray-200" title="Bold">𝐁</button>
          <button class="px-2 py-1 rounded hover:bg-gray-200" title="Italic">𝐼</button>
          <button class="px-2 py-1 rounded hover:bg-gray-200" title="Underline">U̲</button>
          <button class="px-2 py-1 rounded hover:bg-gray-200" title="Add Link">🔗</button>
        </div>
      </div>
      <form class="createPost rounded-[4px] bg-[#fff] border border-[#F2F2F2] hover:border-[#007c8f] focus-within:border-[#007c8f] duration-300 openSans flex-col gap-y-3 p-4">
        <div contenteditable="true" class="comment-editor outline-none post-input editor w-full mentionable mainMention" placeholder="Reply..." data-tribute="true"></div>
        <div class="commentFilePreviewContainer mt-2"></div>
        <div class="create-post-buttons">
          <input id="postFile-{{:postId}}" name="postFile" type="file" class="sr-only" />
          <label for="postFile-{{:postId}}" class="create-post-buttons attach-file inline-flex items-center gap-2 cursor-pointer border rounded px-3 py-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0385 5.72657C10.0743 5.76228 10.1026 5.80468 10.122 5.85136C10.1413 5.89804 10.1513 5.94807 10.1513 5.9986C10.1513 6.04913 10.1413 6.09916 10.122 6.14584C10.1026 6.19252 10.0743 6.23492 10.0385 6.27063L6.09504 10.2117C5.5902 10.7165 4.90551 11 4.19161 11C3.47771 11 2.79306 10.7163 2.28828 10.2115C1.78351 9.70664 1.49995 9.02195 1.5 8.30805C1.50005 7.59415 1.78369 6.9095 2.28852 6.40472L7.05916 1.56392C7.41958 1.20312 7.90856 1.00027 8.41854 1C8.92851 0.99973 9.41771 1.20206 9.77851 1.56247C10.1393 1.92289 10.3422 2.41187 10.3424 2.92185C10.3427 3.43183 10.1404 3.92102 9.77995 4.28182L5.00835 9.12263C4.79166 9.33933 4.49775 9.46107 4.1913 9.46107C3.88484 9.46107 3.59094 9.33933 3.37425 9.12263C3.15755 8.90593 3.03581 8.61203 3.03581 8.30558C3.03581 7.99912 3.15755 7.70522 3.37425 7.48852L7.37781 3.42151C7.41288 3.3841 7.45508 3.35408 7.50193 3.33322C7.54878 3.31236 7.59932 3.30109 7.65059 3.30005C7.70186 3.29902 7.75282 3.30826 7.80047 3.32721C7.84811 3.34617 7.89149 3.37447 7.92804 3.41044C7.96458 3.44641 7.99357 3.48933 8.01328 3.53667C8.03299 3.58401 8.04304 3.63481 8.04282 3.68609C8.04261 3.73737 8.03213 3.78809 8.01202 3.83526C7.99191 3.88243 7.96257 3.92511 7.92572 3.96077L3.92167 8.0321C3.88582 8.06767 3.85733 8.10995 3.83782 8.15653C3.81831 8.2031 3.80816 8.25307 3.80796 8.30357C3.80776 8.35406 3.81751 8.40411 3.83665 8.45084C3.85579 8.49757 3.88394 8.54008 3.91951 8.57593C3.95507 8.61178 3.99735 8.64027 4.04393 8.65978C4.09051 8.67929 4.14047 8.68944 4.19097 8.68964C4.24147 8.68984 4.29151 8.68009 4.33825 8.66095C4.38498 8.64181 4.42748 8.61365 4.46333 8.57809L9.23445 3.73968C9.45114 3.52343 9.57306 3.22996 9.57338 2.92382C9.57369 2.61768 9.45238 2.32395 9.23613 2.10726C9.01988 1.89056 8.7264 1.76865 8.42026 1.76833C8.11413 1.76801 7.8204 1.88933 7.6037 2.10558L2.83403 6.94446C2.65535 7.12286 2.51355 7.3347 2.41674 7.5679C2.31993 7.80109 2.27 8.05107 2.2698 8.30357C2.2696 8.55606 2.31913 8.80612 2.41557 9.03947C2.51201 9.27282 2.65347 9.48489 2.83187 9.66357C3.01026 9.84225 3.22211 9.98404 3.4553 10.0809C3.6885 10.1777 3.93848 10.2276 4.19097 10.2278C4.44346 10.228 4.69352 10.1785 4.92687 10.082C5.16022 9.98559 5.37229 9.84413 5.55097 9.66573L9.49494 5.72465C9.5673 5.65285 9.6652 5.61272 9.76713 5.61308C9.86906 5.61344 9.96668 5.65426 10.0385 5.72657Z" fill="#007C8F"/>
            </svg>
            <span>Attach a File</span>
          </label>

          <button type="submit" class="post" id="comment-post-button" data-id="comment-post-button-{{:postId}}">
            <span>Post</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.4282 5.99409C10.4285 6.12138 10.3948 6.24645 10.3306 6.35635C10.2664 6.46625 10.174 6.55701 10.0629 6.61922L2.56502 10.9062C2.45742 10.9672 2.33595 10.9995 2.21227 11C2.09832 10.9994 1.98616 10.9715 1.88517 10.9187C1.78417 10.8659 1.69727 10.7898 1.63172 10.6965C1.56617 10.6033 1.52386 10.4958 1.50834 10.3829C1.49282 10.27 1.50453 10.155 1.54249 10.0476L2.74809 6.47767C2.75987 6.44277 2.78216 6.41236 2.8119 6.39062C2.84163 6.36888 2.87736 6.35686 2.9142 6.35622H6.14162C6.19059 6.35633 6.23906 6.34636 6.28402 6.32695C6.32898 6.30754 6.36946 6.27909 6.40296 6.24337C6.43646 6.20765 6.46226 6.16543 6.47875 6.11932C6.49525 6.07321 6.50208 6.0242 6.49884 5.97534C6.49074 5.88348 6.44824 5.79808 6.37985 5.73623C6.31145 5.67438 6.22222 5.64065 6.13002 5.64179H2.91509C2.87772 5.64179 2.84129 5.63008 2.81094 5.60829C2.78058 5.5865 2.75782 5.55574 2.74586 5.52034L1.54026 1.95088C1.49228 1.81406 1.48705 1.66588 1.52529 1.52603C1.56352 1.38617 1.6434 1.26126 1.75432 1.16789C1.86524 1.07451 2.00194 1.01709 2.14626 1.00326C2.29059 0.989426 2.43571 1.01983 2.56234 1.09044L10.0638 5.37209C10.1743 5.43416 10.2662 5.52447 10.3302 5.63377C10.3942 5.74307 10.4281 5.86742 10.4282 5.99409Z" fill="white"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
`;

    if (!$.templates[this.templateName]) $.templates(this.templateName, template);
  }


  renderPosts(records) {
    const html = $.render[this.templateName](records);
    if (this.mount) this.mount.innerHTML = html;
  }

  onCreatePost(handler) {
    if (!this.postButton) return;
    this.postButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const copy = (this.postTextarea?.innerHTML ?? "").trim();
      const fileInput = document.getElementById('postFile');
      let fileMeta = null;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        try {
          const file_link = await uploadAndGetFileLink(file);
          const mime = (file.type || '').toLowerCase();
          let category = 'File';
          if (mime.startsWith('image/')) category = 'Image';
          else if (mime.startsWith('video/')) category = 'Video';
          else if (mime.startsWith('audio/')) category = 'Audio';
          else {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const imageExts = ['jpg','jpeg','png','gif','webp','bmp','svg','heic','heif'];
            const videoExts = ['mp4','mov','avi','mkv','webm','mpeg','mpg','m4v'];
            const audioExts = ['mp3','wav','aac','ogg','flac','m4a'];
            if (imageExts.includes(ext)) category = 'Image';
            else if (videoExts.includes(ext)) category = 'Video';
            else if (audioExts.includes(ext)) category = 'Audio';
          }
          fileMeta = {
            file_name: file.name,
            file_link,
            file_type: category,
            file_size: file.size,
          };
        } catch (err) {
          alert('File upload failed: ' + err.message);
          return;
        }
      }
      handler?.({ copy, fileMeta });
    });
  }

  onUpvote(handler) {
    if (!this.mount) return;
    this.mount.addEventListener("click", (e) => {

      const t = e.target && e.target.nodeType === Node.TEXT_NODE ? e.target.parentElement : e.target
      const postUpvoteBtn = t.closest("[data-action='upvote-post']");
      const commentUpvoteBtn = t.closest("[data-action='upvote-comment']")
      const replyUpvoteBtn = t.closest("[data-action='upvote-reply']")

      if (!postUpvoteBtn && !commentUpvoteBtn && !replyUpvoteBtn) {
        return
      }

      let payload
      if (postUpvoteBtn) {
        const postId = postUpvoteBtn.dataset.postId
        payload = {
          type: 'post',
          postId: postId
        }

      } else if (commentUpvoteBtn) {
        const commentId = commentUpvoteBtn.dataset.commentId
        const postCard = commentUpvoteBtn.closest(".postCard");
        payload = {
          type: 'comment',
          commentId: commentId,
          postId: postCard?.getAttribute("current-post-id") || commentDeleteBtn.dataset.postId || null
        }
      } else if (replyUpvoteBtn) {
        const replyId = replyUpvoteBtn.dataset.replyId
        const postCard = replyUpvoteBtn.closest(".postCard");
        payload = {
          type: 'reply',
          commentId: replyId,
          postId: postCard?.getAttribute("current-post-id") || commentDeleteBtn.dataset.postId || null
        }

      }
      handler?.(payload);
    });
  }

  onCommentButtonClicked(handler) {
    if (!this.mount) return;
    this.mount.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action='toggle-comment']");
      if (!el) return;
      const postId = el.dataset.postId;
      handler(postId);
    })
  }

  onReplyButtonClicked(handler) {
    if (!this.mount) return;
    this.mount.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action='toggle-reply']")
      if (!el) return;
      const commentId = el.dataset.commentId;
      handler(commentId);
    })
  }


  onDeleteRequest(handler) {
    if (!this.mount) return;

    this.mount.addEventListener("click", (e) => {
      // Normalize target: handle clicks on <path>, text nodes, etc.
      const t = e.target && e.target.nodeType === Node.TEXT_NODE
        ? e.target.parentElement
        : e.target;

      const postDeleteBtn = t.closest("[data-action='delete-request']");
      const commentDeleteBtn = t.closest("[data-action='delete-comment-request']");

      if (!postDeleteBtn && !commentDeleteBtn) return;

      // Build a clear payload for the caller
      let payload;

      if (commentDeleteBtn) {
        const commentId = commentDeleteBtn.dataset.commentId;
        // find the owning post for context
        const postCard = commentDeleteBtn.closest(".postCard");
        const postId =
          postCard?.getAttribute("current-post-id") || commentDeleteBtn.dataset.postId || null;

        payload = { type: "comment", postId, commentId };
      } else {
        const postId = postDeleteBtn.dataset.postId;
        payload = { type: "post", postId };
      }

      this.openDeleteModal({
        onConfirm: () => handler?.(payload),
      });
    });
  }


  applyUpvoteStyles(postId, voteId) {
    const el = this.mount?.querySelector(
      `[data-action="upvote"][data-post-id="${postId}"]`
    );
    if (!el) return;

    const svgPath = el.querySelector("svg path");
    const label = el.querySelector("p");

    const isVoted = voteId != "";

    el.style.setProperty("background", isVoted ? "#007c8f" : "transparent", "important");
    svgPath?.style.setProperty("fill", isVoted ? "white" : "#007C8F", "important");
    label?.style.setProperty("color", isVoted ? "white" : "black", "important");
  }

  removePostNode(postId) {
    const node = this.mount?.querySelector(`[current-post-id='${postId}']`);
    node?.remove();
  }

  removeCommentNOde(commentId) {
    const node = this.mount?.querySelector("")
  }

  openDeleteModal({ onConfirm }) {
    document.getElementById(this.modalRootId)?.remove();
    const root = document.createElement("div");
    root.id = this.modalRootId;
    root.innerHTML = `
      <div class="modal-backdrop" data-close="true"></div>
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="deleteTitle">
        <h5 id="deleteTitle" class="modal-title">Are you sure you want to delete?</h5>
        <div class="delete-inner-div">
          <button class="modal-button modal-yes" data-yes>Yes</button>
          <button class="modal-button modal-no" data-no>No</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    document.body.style.overflow = "hidden";
    const close = () => {
      root.remove();
      document.body.style.overflow = "";
    };
    root.addEventListener("click", (e) => {
      if (e.target?.dataset?.close !== undefined) close();
    });
    root.querySelector("[data-no]")?.addEventListener("click", close);
    root.querySelector("[data-yes]")?.addEventListener("click", async () => {
      try {
        await onConfirm?.();
      } finally {
        close();
      }
    });
    root.querySelector("[data-yes]")?.focus();
  }

  autoResizePostTextarea() {
    if (!this.postTextarea) return;
    const el = this.postTextarea;
    const resize = function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    };
    el.addEventListener("input", resize);
    resize.call(el);
  }

  removeFieldData() {
    if (!this.postTextarea) return;
    this.postTextarea.innerHTML = "";
    this.postTextarea.style.height = "auto";
  }

  getAllMentionId() {
    const section = document.querySelector('section.createPost');

    const uniqueNumericIds = [...new Set(
      [...section.querySelectorAll('#post-data span[input-post-contact-id]')]
        .map(el => Number(el.getAttribute('input-post-contact-id')))
        .filter(Number.isFinite)
    )];

    return uniqueNumericIds

  }

  toggleCreateForumSection(element) {
    element.classList.toggle('hidden');
  }

  getCommentValueObj(handler) {
    const container = document
    document.addEventListener("submit", async (e) => {
      let form = e.target.closest(".commentForm")
      if (!form) return;
      e.preventDefault();

      // const scope = form.dataset.parentType === 'post' ? 'comment' : 'reply';
      const parentId = form.dataset.parentId || null;
      const editor = form.querySelector('.comment-editor');
      const html = (editor?.innerHTML || '').trim();

      handler?.({ html: html, forumId: Number(parentId) }, editor)
    })
  }

  getReplyValueObj(handler) {
    const container = document
    document.addEventListener("submit", async (e) => {
      let form = e.target.closest(".ReplyForm")
      if (!form) return;
      e.preventDefault();

      // const scope = form.dataset.parentType === 'post' ? 'comment' : 'reply';
      const parentId = form.dataset.parentId || null;
      const editor = form.querySelector('.reply-editor');

      const html = (editor?.innerHTML || '').trim();
      handler?.({ content: html, commentId: Number(parentId) }, editor)
    })
  }

  initCommentReplyToggles() {
    function flipChevron(labelEl, isOpen) {
      const chev = labelEl.querySelector('.inline-block');
      if (!chev) return;
      chev.classList.toggle('rotate-180', isOpen);
      chev.classList.toggle('rotate-0', !isOpen);
    }

    document.addEventListener('click', function (e) {
      const labelEl = e.target.closest('.label.cursor-pointer');
      if (!labelEl) return;

      // If inside a commentCard -> it's the "X Replies" divider
      const commentCard = labelEl.closest('.commentCard');
      if (commentCard) {
        const repliesContainer = commentCard.querySelector('div[id^="comments-"]');
        if (!repliesContainer) return;

        const willHide = !repliesContainer.classList.contains('hidden');
        repliesContainer.classList.toggle('hidden', willHide);
        flipChevron(labelEl, !willHide);
        return;
      }

      // Otherwise it's the post-level "X Comments" divider
      const postCard = labelEl.closest('.postCard');
      if (!postCard) return;

      // Toggle ONLY the comment items; leave forms alone
      const commentItems = postCard.querySelectorAll('.commentCard');
      if (!commentItems.length) return;

      const anyVisible = Array.from(commentItems).some(el => !el.classList.contains('hidden'));
      commentItems.forEach(el => el.classList.toggle('hidden', anyVisible));
      flipChevron(labelEl, !anyVisible);
    });
  }

  disableElements(element){

  }
}
