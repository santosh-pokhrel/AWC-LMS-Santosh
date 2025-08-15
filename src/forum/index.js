// import { config } from '../sdk/config.js';
// import { VitalStatsSDK } from '../sdk/init.js';
// import {Forum} from '../forum/forumsCore.js'

// (async function main() {
//     try {
//         const { slug, apiKey } = config;
//         const sdk = new VitalStatsSDK({ slug, apiKey });
//         const plugin = await sdk.initialize();
//         window.tempPlugin ??= plugin;
//         const forum = new Forum(plugin)
//     } catch (error) {
//         console.log(error)
//     }
// }
// )()


import { config } from "../sdk/config.js";
import { VitalStatsSDK } from "../sdk/init.js";
import { ForumController } from "../forum/controller.js";
import { ForumModel } from "../forum/modal.js";
import { ForumView } from "../forum/views.js";

(async function bootstrap() {
    try {
        const { slug, apiKey } = config;
        const sdk = new VitalStatsSDK({ slug, apiKey });
        const plugin = await sdk.initialize();

        // Optional: keep a reference for debugging
        window.tempPlugin ??= plugin;

        // Compose MVC
        const model = new ForumModel(plugin, "EduflowproForumPost");
        const view = new ForumView({
            mountId: "renderForms",
            modalRootId: "modal-root",
            postTextareaId: "post-data",
            postButtonId: "post-button",
        });
        const controller = new ForumController(model, view);

        // Kick things off
        controller.init();
    } catch (error) {
        console.error(error);
    }
})();