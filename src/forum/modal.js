// import { registerTemplates, mapper } from "../utils/helper.js";

// export class ForumModel {
//     constructor(plugin, modelName = "EduflowproForumPost") {
//         this.plugin = plugin;
//         this.model = plugin.switchTo(modelName);
//         this.limit = 500;
//         this.offset = 0;
//         this.query = null;                 
//         this.subscriptions = new Set();    

//         this.init();
//     }

//     /* --------------------------- Lifecycle --------------------------- */

//     async init() {
//         this.buildQuery();
//         await this.fetchPosts();           // initial fetch
//         this.subscribeToPosts();           // live updates
//         this.setupModelSubscription();     // optional safety net
//     }

//     destroy() {
//         this.unsubscribeAll();
//         if (this.query?.destroy) this.query.destroy();
//         this.query = null;
//     }

//     /* --------------------------- Query Setup ------------------------- */

//     buildQuery() {
//         // Use a stateful dataset query so fetch() populates local state,
//         // and subscribe() streams changes for the same dataset.
//         this.query = this.model
//             .query()
//             .where("forum_status", "Published - Not flagged")
//             .orderBy("created_at", "desc")
//             .limit(this.limit)
//             .offset(this.offset)
//             .include("Author", (q) => q.select(["id", "Display_Name"])) 
//             .noDestroy();

//         return this.query;
//     }

//     /* --------------------------- Fetch (one-shot) -------------------- */

//     async fetchPosts() {
//         try {
//             // Populate the dataset tied to this.query
//             await this.query.fetch().pipe(window.toMainInstance?.(true) ?? (x => x)).toPromise();
//             this.renderFromState();
//         } catch (err) {
//             console.error("Error fetching forum posts:", err);
//         }
//     }

//     renderFromState() {
//         // Read from the dataset (already filtered/ordered/limited)
//         const recs = this.query
//             .getAllRecordsArray()
//             .slice(0, this.limit);

//         const mappedPosts = mapper(recs);
//         registerTemplates(mappedPosts);
//     }

//     /* --------------------------- Live Subscription ------------------- */

//     subscribeToPosts() {
//         this.unsubscribeAll(); // avoid duplicate streams

//         try {
//             const liveObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
//             const liveSub = liveObs
//                 .pipe(window.toMainInstance?.(true) ?? (x => x))
//                 .subscribe({
//                     next: (payload) => {
//                         // payload can be {records: [...] } or just [...]
//                         const data = Array.isArray(payload?.records)
//                             ? payload.records
//                             : Array.isArray(payload)
//                                 ? payload
//                                 : [];

//                         const mappedPosts = mapper(data);
//                         registerTemplates(mappedPosts);
//                     },
//                     error: (err) => {
//                         console.error("Forum live subscription error:", err);
//                     }
//                 });

//             this.subscriptions.add(liveSub);
//         } catch (error) {
//             console.error("Error setting up forum live subscription:", error);
//         }
//     }

//     /* --------------------------- Mutations --------------------------- */

//     async createPost(userData) {
//         try {
//             const mutation = this.plugin.mutation().switchTo(this.model);
//             mutation.createOne({
//                 published_date: Date.now().toString(),
//                 author_id: "90",
//                 copy: userData.copy,
//             });

//             const result = await mutation.execute(true).toPromise();

//             if (!result.isCancelling) {
//                 alert("New post created")
//             } else {
//                 alert("Error while cancelling the records");
//             }
//         } catch (err) {
//             console.error("Error creating post:", err);
//             alert("Failed to create the post");
//         }
//     }

//     async deletePostById(postId) {
//         try {
//             const result = await this.plugin
//                 .mutation()
//                 .switchTo(this.model)
//                 .delete(q => q.where("id", postId))
//                 .execute(true)
//                 .toPromise();

//             return result;
//         } catch (error) {
//             console.error("Error deleting post:", error);
//             throw error;
//         }
//     }

//     /* --------------------------- Safety Net -------------------------- */

//     setupModelSubscription() {
//         // Some SDKs emit model-level changes; if so, re-render from state.
//         const modelUnsub = this.model.subscribe?.({
//             next: () => this.renderFromState(),
//             error: (err) => console.error("Model subscription error:", err),
//         });

//         if (modelUnsub) this.subscriptions.add(modelUnsub);
//     }

//     /* --------------------------- Utils ------------------------------- */

//     setPaging({ limit = this.limit, offset = this.offset } = {}) {
//         this.limit = limit;
//         this.offset = offset;
//         if (this.query?.destroy) this.query.destroy();
//         this.buildQuery();
//         this.fetchPosts();
//         this.subscribeToPosts();
//     }

//     unsubscribeAll() {
//         this.subscriptions.forEach(sub => {
//             if (typeof sub === "function") sub();        
//             else sub?.unsubscribe?.();                   
//         });
//         this.subscriptions.clear();
//     }
// }

export class ForumModel {
    constructor(plugin, modelName = "EduflowproForumPost") {
        window.plugin = plugin;
        window.eduflowproForumPostmodel = plugin.switchTo(modelName);
        this.limit = 500;
        this.offset = 0;
        this.query = null;
        this.subscriptions = new Set();
        this.dataCallback = null;
    }

    onData(cb) {
        this.dataCallback = cb;
    }

    async init() {
        this.buildQuery();
        await this.fetchPosts();
        this.subscribeToPosts();
        this.setupModelSubscription();
    }

    destroy() {
        this.unsubscribeAll();
        if (this.query?.destroy) this.query.destroy();
        this.query = null;
    }

    buildQuery() {
        this.query = eduflowproForumPostmodel
            .query()
            .deSelectAll()
            .select(['id'])
            .where('forum_status', 'Published - Not flagged')
            .orderBy('created_at', 'desc')
            .include('Author', q =>
                q.deSelectAll().select(['id', 'Display_Name', 'is_instructor'])
            )
            .include('Forum_Reactors_Data', q =>
                q.deSelectAll().select(['id', 'forum_reactor_id', 'reacted_to_forum_id'])
            )
            .noDestroy();
        return this.query;
    }

    async fetchPosts() {
        try {
            await this.query.fetch().pipe(window.toMainInstance?.(true) ?? ((x) => x)).toPromise();
            this.renderFromState();
        } catch { }
    }

    renderFromState() {
        const recs = this.query.getAllRecordsArray();
        if (this.dataCallback) this.dataCallback(recs);
    }

    subscribeToPosts() {
        this.unsubscribeAll();
        try {
            const liveObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
            const liveSub = liveObs
                .pipe(window.toMainInstance?.(true) ?? ((x) => x))
                .subscribe({
                    next: (payload) => {
                        const data = Array.isArray(payload?.records)
                            ? payload.records
                            : Array.isArray(payload)
                                ? payload
                                : [];
                        if (this.dataCallback) this.dataCallback(data);
                    },
                    error: () => { }
                });
            this.subscriptions.add(liveSub);
        } catch { }
    }

    async createPost({ authorId, copy }) {
        let postquery = eduflowproForumPostmodel.mutation()
        postquery.createOne({
            published_date: Math.floor(Date.now() / 1000).toString(),
            author_id: authorId,
            copy: copy
        });
        const result = await postquery.execute(true).toPromise();
        return result;
    }

    async deletePostById(postId) {
        try {
            const result = await 
                eduflowproForumPostmodel.mutation().delete((q) => q.where("id", postId))
                .execute(true)
                .toPromise();
            return result;
        } catch (error) {
            throw error;
        }
    }

    setupModelSubscription() {
        const modelUnsub = plugin
            .mutation()
            .switchTo("EduflowproForumPost").subscribe?.({
            next: () => this.renderFromState(),
            error: () => { }
        });
        if (modelUnsub) this.subscriptions.add(modelUnsub);
    }

    setPaging({ limit = this.limit, offset = this.offset } = {}) {
        this.limit = limit;
        this.offset = offset;
        if (this.query?.destroy) this.query.destroy();
        this.buildQuery();
        this.fetchPosts();
        this.subscribeToPosts();
    }

    unsubscribeAll() {
        this.subscriptions.forEach((sub) => {
            if (typeof sub === "function") sub();
            else sub?.unsubscribe?.();
        });
        this.subscriptions.clear();
    }

    async createVote({Forum_Reactor_ID, Reacted_to_Forum_ID}){
        let query = plugin.switchTo("EduflowproOForumReactorReactedtoForum").mutation()
        query.createOne({
            forum_reactor_id: Number(Forum_Reactor_ID),
            reacted_to_forum_id: Number(Reacted_to_Forum_ID)
        })
        const result = await query.execute(true).toPromise();
        return result
    }
    
    async deleteVote(id){
        let query = plugin.switchTo("EduflowproOForumReactorReactedtoForum").mutation()
        query.delete((q) =>q.where("id", id))
        const result = await query.execute(true).toPromise();
        return result
    }
}


