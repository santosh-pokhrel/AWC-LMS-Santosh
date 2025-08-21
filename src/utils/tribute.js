export let tributObj = {
    trigger: '@',
    iframe: null,
    selectClass: 'highlight',
    selectTemplate: function (item) {
        return '@' + item.original.value;
    },
    menuItemTemplate: function (item) {
        return item.original.key;
    },
    noMatchTemplate: null,
    menuContainer: document.body,
    lookup: 'key',
    fillAttr: 'value',
    values: [
        { key: 'Alice Johnson', value: 'alice' },
        { key: 'Bob Smith', value: 'bob' },
        { key: 'Charlie Brown', value: 'charlie' }
    ],
    requireLeadingSpace: true,
    allowSpaces: false,
    replaceTextSuffix: '\n',
};
