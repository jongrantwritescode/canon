"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversesModule = void 0;
const common_1 = require("@nestjs/common");
const universes_controller_1 = require("./universes.controller");
const universes_service_1 = require("./universes.service");
const graph_module_1 = require("../graph/graph.module");
const builder_module_1 = require("../builder/builder.module");
const queue_module_1 = require("../queue/queue.module");
const markdown_service_1 = require("../common/markdown.service");
let UniversesModule = class UniversesModule {
};
exports.UniversesModule = UniversesModule;
exports.UniversesModule = UniversesModule = __decorate([
    (0, common_1.Module)({
        imports: [graph_module_1.GraphModule, builder_module_1.BuilderModule, queue_module_1.QueueModule],
        controllers: [universes_controller_1.UniversesController],
        providers: [universes_service_1.UniversesService, markdown_service_1.MarkdownService],
    })
], UniversesModule);
//# sourceMappingURL=universes.module.js.map