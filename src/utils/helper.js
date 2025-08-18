// import { UserConfig } from "../sdk/userConfig.js";
// export function registerTemplates(records) {
//   const template = `
//       <div current-post-id="{{: postId }}" class="relative bg-white rounded p-3 mb-4 postCard border border-[#F2F2F2]">
//         {{if canDelete }}
//           <div class="cursor-pointer actionToggleButton relative w-max ml-auto">
//             <svg width="20" height="20" viewBox="0 0 4 14" xmlns="http://www.w3.org/2000/svg" class="fill-[#414042]"><path d="M3.45679 6.99992C3.45679 7.34176 3.35542 7.67593 3.1655 7.96016C2.97558 8.2444 2.70565 8.46593 2.38982 8.59675C2.074 8.72757 1.72648 8.76179 1.3912 8.6951C1.05593 8.62841 0.747957 8.4638 0.506236 8.22208C0.264516 7.98036 0.0999019 7.67239 0.0332114 7.33711C-0.0334791 7.00184 0.000748884 6.65431 0.131567 6.33849C0.262385 6.02267 0.483918 5.75273 0.768151 5.56281C1.05238 5.37289 1.38655 5.27152 1.7284 5.27152C2.18679 5.27152 2.62642 5.45362 2.95056 5.77776C3.27469 6.1019 3.45679 6.54152 3.45679 6.99992Z"/><path d="M1.7284 3.79C2.07024 3.79 2.40441 3.68867 2.68864 3.49876C2.97287 3.30884 3.19441 3.0389 3.32522 2.72308C3.45604 2.40725 3.49027 2.05973 3.42358 1.72445C3.35689 1.38918 3.19228 1.08121 2.95056 0.839488C2.70884 0.597768 2.40086 0.433154 2.06559 0.366463C1.73031 0.299773 1.38279 0.334001 1.06697 0.464819C0.751145 0.595637 0.481206 0.81717 0.291288 1.1014C0.101369 1.38564 0 1.7198 0 2.06165C0 2.52 0.182099 2.95967 0.506236 3.28381C0.830373 3.60794 1.27 3.79 1.7284 3.79Z"/><path d="M1.7284 10.21C1.38655 10.21 1.05238 10.3112 0.768151 10.5011C0.483918 10.691 0.262385 10.9609 0.131567 11.2768C0.000748884 11.5926 -0.0334791 11.9401 0.0332114 12.2754C0.0999019 12.6107 0.264516 12.9186 0.506236 13.16C0.747957 13.4021 1.05593 13.5667 1.3912 13.6334C1.72648 13.7001 2.074 13.6658 2.38982 13.535C2.70565 13.4042 2.97558 13.1827 3.1655 12.8984C3.35542 12.6142 3.45679 12.28 3.45679 11.9382C3.45679 11.48 3.27469 11.04 2.95056 10.716C2.62642 10.3919 2.18679 10.21 1.7284 10.21Z"/></svg>
//             <div class="actionItemsWrapper shadow-lg absolute top-[1rem] right-0 flex flex-col gap-3 p-2 bg-white w-max hidden">
//               <button class="deletePostButton text-red-500 hover:text-red-700 focus:outline-none" data-action="delete-request" data-post-id="{{:postId}}">Delete</button>
//             </div>
//           </div>
//         {{/if}}

//         <div class="flex items-center gap-4">
//           <img class="w-6 h-6 rounded-full border border-[#d3d3d3]" src="https://i.ontraport.com/265848.fef288b2e2a570a362d1141a783309d8.JPEG">
//           <div class="flex items-center gap-4">
//             <div class="text-[#414042] button max-[600px]:tracking-[0.86px] line-clamp-1">{{:author}}</div>
//             <div class="py-1.5 px-3 bg-[#c7e6e6] rounded-[36px] font-[400] text-[12px] text-[#414042] line-clamp-1">
//             {{:designation}}
//           </div>

//             <div class="w-[2px] h-[15px] bg-[#bbbcbb] max-[600px]:hidden"></div>
//             <div class="text-[#586a80] small-text line-clamp-1">{{:published_days_ago}} </div>
//           </div>
//         </div>

//         <div class="my-2 content-container">
//           <span class="mention" data-contact-id="39041">@Nat Newman</span>&nbsp;{{:copy}}
//         </div>

//         <div class="flex items-center gap-4">
//           <button class="roundedButton upVoted" data-action="upvote" data-type="post" data-post-id="{{:postId}}">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3092 5.81653C14.1751 5.66459 14.0103 5.54291 13.8255 5.45958C13.6408 5.37625 13.4405 5.33318 13.2378 5.33322H9.90462V4.38087C9.90462 3.74942 9.65378 3.14384 9.20728 2.69734C8.76079 2.25084 8.1552 2 7.52376 2C7.43529 1.99994 7.34856 2.02452 7.27329 2.07099C7.19801 2.11746 7.13717 2.18397 7.09758 2.26309L4.84885 6.76174H2.28584C2.03327 6.76174 1.79103 6.86207 1.61243 7.04067C1.43383 7.21927 1.3335 7.46151 1.3335 7.71409V12.952C1.3335 13.2046 1.43383 13.4468 1.61243 13.6254C1.79103 13.804 2.03327 13.9043 2.28584 13.9043H12.5236C12.8716 13.9045 13.2077 13.7775 13.4688 13.5474C13.7298 13.3172 13.8979 12.9997 13.9414 12.6544L14.6557 6.9403C14.681 6.73913 14.6632 6.53488 14.6034 6.34112C14.5437 6.14736 14.4434 5.96854 14.3092 5.81653ZM2.28584 7.71409H4.66671V12.952H2.28584V7.71409Z" fill="#007C8F"></path></svg>
//             <p class="text-label vote-count">1</p>
//           </button>
//           <div class="text-[#007b8e] text-label cursor-pointer" data-action="toggle-comment" data-post-id="{{:postId}}">Comment</div>
//         </div>

//         <div id="comments-{{:postId}}" class="mt-4"></div>

//         <!-- Collapsible comment form (initially hidden); your JS can toggle it by data-post-id -->
//         <div class="mt-4 commentForm hidden" id="commentForm_{{:postId}}" data-parent-id="{{:postId}}" data-parent-type="post" data-forum-post-id="{{:postId}}">
//           <div class="containerForToolbar">
//             <div class="flex flex-wrap items-center gap-2 bg-white border border-gray-300 rounded p-2 shadow">
//               <button class="px-2 py-1 rounded hover:bg-gray-200" title="Bold">𝐁</button>
//               <button class="px-2 py-1 rounded hover:bg-gray-200" title="Italic">𝐼</button>
//               <button class="px-2 py-1 rounded hover:bg-gray-200" title="Underline">U̲</button>
//               <button class="px-2 py-1 rounded hover:bg-gray-200" title="Add Link">🔗</button>
//             </div>
//           </div>
//           <form class="rounded-[4px] bg-[#fff] border border-[#F2F2F2] hover:border-[#007c8f] focus-within:border-[#007c8f] duration-300 openSans flex-col gap-y-3 p-4">
//             <div contenteditable="true" class="comment-editor editor w-full mentionable mainMention" placeholder="Reply..." data-tribute="true"></div>
//             <div class="commentFilePreviewContainer mt-2"></div>
//             <div class="comment-file-wrapper flex items-center justify-end gap-3 mt-2">
//               <div class="replaceFileContainerComment outlineButton text-label flex gap-x-2 items-center cursor-pointer" style="display:none;"><span></span><span>Replace</span></div>
//               <div class="deleteFileContainerComment outlineButton text-label flex gap-x-2 items-center cursor-pointer" style="display:none;"><span></span><span>Delete</span></div>
//               <div class="attachAFileForComment">
//                 <button type="button" class="outlineButton flex items-center gap-2 relative"><span>📎</span><span class="text-label w-max">Attach a File</span><input type="file" name="commentFile" class="formFileInputForComment absolute w-full opacity-0 top-0 left-0"></button>
//               </div>
//               <button type="submit" class="primaryButton flex items-center gap-2 border border-[#007c8f] py-2 px-3 bg-[#007c8f] rounded"><span class="text-label text-[#fff] w-max">Post</span></button>
//             </div>
//           </form>
//         </div>
//       </div>`;

//   $.templates("PostTemplate", template);
//   const html = $.render.PostTemplate(records);
//   document.getElementById("renderForms").innerHTML = html;


//   document.querySelectorAll(".deletePostButton").forEach(button => {
//     button.addEventListener("click", (e) => {
//       const postId = e.currentTarget.getAttribute("data-post-id");
//       this.createDeleteModal(postId);
//     });
//   });

//   document.getElementById("renderForms").addEventListener("click", (e) => {
//     const el = e.target.closest("[data-action='upvote']");
//     if (!el) return;
//     const postId = el.dataset.postId;
//     handler?.(postId);
//   });
// }

// export function mapper(records) {
//   return records.map((item) => ({
//     copy: item.copy,
//     published_date: item.published_date ?? null,
//     published_days_ago: item.published_date ? timeAgo(item.published_date) : null,
//     author: item.Author?.display_name ?? 'Anonymous',
//     canDelete: checkUserValidation(item.author_id),
//     postId: item.id,
//     designation: checkDesignation(item.Author?.is_instructor)
//   }));
// }

// function timeAgo(date) {
//   const now = new Date();
//   const then = new Date(date * 1000);
//   const diff = Math.floor((now - then) / 1000);
//   if (diff < 60) return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
//   return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
// }

// function checkDesignation(boolean) {
//   if (boolean) {
//     return 'Teacher'
//   } else {
//     return 'Student'
//   }
// }

// function checkUserValidation(authorId) {
//   const user = new UserConfig();
//   return authorId == user.userId;
// }

import { UserConfig } from "../sdk/userConfig.js";
const user = new UserConfig();

export function forumMapper(records) {
  return records.map((item) => ({
    copy: item.copy,
    published_date: item.published_date ?? null,
    published_days_ago: item.published_date ? timeAgo(item.published_date) : null,
    author: item.Author?.display_name ?? "Anonymous",
    canDelete: checkUserValidation(item.author_id),
    postId: item.id,
    designation: checkDesignation(item.Author?.is_instructor),
    voteCount: findVoteCount(item.Forum_Reactors_Data) || 0,
    voteId : getVoteId(item, user.userId), 
    Comment: getAllComments({ item: item, author: item.Author?.display_name ?? "Anonymous"})
  }));
}


function findVoteCount(item){
  if(item){
    let length =  Object.values(item).length
    return length
  }
}


function getVoteId(item, uid = user.userId) {
  const map = item?.Forum_Reactors_Data ?? {};
  for (const [key, data] of Object.entries(map)) {
    const reactorId = data?.forum_reactor_id ?? data?.Forum_Reactor?.id;
    if (String(reactorId) === String(uid)) {
      return data?.id ?? key;
    }
  }
  return "";
}


export function timeAgo(date) {
  const now = Date.now();
  const ts = String(date).length > 10 ? Number(date) : Number(date) * 1000;
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const d = Math.floor(diff / 86400);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

export function checkDesignation(boolean) {
  return boolean ? "Teacher" : "Student";
}

export function checkUserValidation(authorId) {
  return String(authorId) === String(user.userId);
}


export function contactMapper(records){
  return records.filter(item => (item.display_name != null )).map(item =>({
    contact_id:item.id,
    display_name: item.display_name
  }))
}

export let tributObj = {
  trigger: '@',
  iframe: null,
  selectClass: 'highlight',
  selectTemplate: function (item) {
    const name = item.original.display_name || item.string || '';
    return `<span input-post-contact-id="${item.original.contact_id}" class="mention"> ${name} </span>`;
  },
  menuItemTemplate: function (item) {
    return item.original.display_name || '';
  },
  noMatchTemplate: null,
  menuContainer: document.body,
  lookup: 'display_name',
  fillAttr: 'display_name',
  values: [],
  requireLeadingSpace: true,
  allowSpaces: false
};

function getAllComments({item, author}){
  if (item?.ForumComments){
    return Object.values(item?.ForumComments).map((item) => ({
      comment: item.comment,
      author: author, 
    }))
  }
  return null
}
