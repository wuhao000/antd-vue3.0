"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentType = void 0;
var ComponentType;
(function (ComponentType) {
    ComponentType["Tool"] = "tool";
    ComponentType["UIComponent"] = "component";
    ComponentType["Directive"] = "directive";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
const resolveComponents = () => {
    const packageMap = require('../src/components/map.json');
    const componentList = [];
    Object.keys(packageMap).forEach(name => {
        const componentName = name.split('-').map(it => it.substring(0, 1).toUpperCase() + it.substring(1)).join('');
        componentList.push({
            name: packageMap[name].name,
            id: name,
            componentType: packageMap[name].componentType,
            zhName: packageMap[name].chineseName,
            upperCase: componentName,
            type: packageMap[name].type,
            tag: packageMap[name].tag
        });
    });
    return componentList;
};
module.exports = resolveComponents();
