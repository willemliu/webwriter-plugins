'use strict';

var BlockContentCommand = require('writer/commands/BlockContentCommand');
var uuid = require('substance/util/uuid');
var _ = require('lodash');
var idGen = require('writer/utils/IdGenerator');

function TextframeCommand() {
    TextframeCommand.super.apply(this, arguments);
    this.mimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/png'
    ];
}

function Observer(command, nodeId) {
    this.command = command;
    this.nodeId = nodeId;
}

Observer.prototype.preview = function (data) {

    if (this.nodeId) {
        this.node = this.command.context.doc.get(this.nodeId);
        this.node.removeImage();
        this.node.setPreviewImage(data);
        this.replacement = true;
    } else {
        this.id = this.command.createPreviewNode(data);
        this.node = this.command.context.doc.get(this.id);
        this.replacement = false;
    }

    //this.node.setPreviewImage(data);
    this.node.preview();
};

Observer.prototype.progress = function (progress) {
    this.node.setProgress(progress > 90 ? 90 : progress);
};

Observer.prototype.done = function (data) {
    var dom = data.dom,
        imageUrl = data.imageUrl;

    var newsItem = dom.querySelector('newsItem'),
        uuid = newsItem.getAttribute('guid'),
        uri = dom.querySelector('itemMeta > itemMetaExtProperty[type="imext:uri"]');

    if (!imageUrl) {
        this.command.getUrlAndUpdateDocument(dom, this.node, this.replacement);
    } else {
        this.node.updateMetaData({
            uuid: uuid,
            uri:uri.attributes['value'].value,
            url:imageUrl,
            progress: 100
        });
    }
};



/**
 * Get the width from data > width element
 * @param {Node} el
 * @returns {number} Returns 0 if no element was found
 */
var getWidthFromElement = function (el) {
    var widthValue = 0;
    if (el) {
        var widthArray = el.textContent.match(/^\d+/);
        if (widthArray && widthArray.length) {
            widthValue = widthArray[0];
        }
    }
    return widthValue;
};

/**
 * Get the height from data > height element
 * @param el
 * @returns {number}
 */
var getHeightFromElement = function (el) {
    var heightValue = 0;
    if (el) {
        var heightArray = el.textContent.match(/^\d+/);
        if (heightArray && heightArray.length) {
            heightValue = heightArray[0];
        }
    }
    return heightValue;
};


TextframeCommand.Prototype = function() {

    this.execute = function(param) {

        // if (this.getCommandState().disabled) {
        //     return false;
        // }

        if (_.isString(param)) {
            // No handling of ordinary uri strings.
            return false;
        }

        if (!param.type || !param.context || !param.context.nodeId) {
            // "Unsupported drop information, something is missing among param.type [" + param.type + "], param.context [" + param.context + "]" ;
            // Ignore this drop
            return false;
        }

        switch (param.type) {
            case 'uri':
                this.handleUri(param.data, param.context.nodeId);
                break;
            case 'file':
                this.handleFiles(param.data, param.context.nodeId);
                break;
            case 'newsItem':
                this.handleNewsItem(param.data, param.context.nodeId);
                break;
            default:
                throw "XimimageCommand cannot handle drop of type: " + param.type;
        }

        return true;
    };

    this.handleUri = function (uri, nodeId) {
        this.context.api.uploadUri(uri, {allowedItemClasses: ['ninat:picture']},
            new Observer(this, nodeId));
    };

    this.handleNewsItem = function (newsItem, nodeId) {
        var observer = new Observer(this, nodeId);

        observer.preview(null);
        observer.progress(100);
        observer.done({dom: newsItem});
    };

    this.insertTextframe = function (files) {
        if (this.getCommandState().disabled) {
            return;
        }

        if (files && files.length) {
            this.handleFiles(files);
        }
        else {
            this.createEmptyNode();
        }
    };

    this.handleFile = function (file, nodeId) {
        this.context.api.uploadFile(file,
            {allowedItemClasses: ['ninat:picture'], allowedMimeTypes: this.mimeTypes},
            new Observer(this, nodeId));
    };

    this.handleFiles = function (files, nodeId) {
        if (!_.isArrayLike(files)) {
            this.handleFile(files, nodeId);
        } else {
            for (var i = 0; i < files.length; i++) {
                this.handleFile(files[i], nodeId);
            }
        }
    };

    this.createEmptyNode = function() {

        var data = {
            type: 'textframe',
            dataType: 'fdmg/textframe',
            id: idGen(),
            uuid: '',
            url: '',
            alignment: '',
            previewUrl: '',
            progress: 100,
            imageType: 'x-im/image',
            title: '',
            text: ''
        };

        return this.context.api.insertBlockNode(data.type, data);
    };

    this.createPreviewNode = function(data) {
        var data = {
            type: 'textframe',
            dataType: 'fdmg/textframe',
            id: idGen(),
            uuid: '',
            url: '',
            alignment: '',
            previewUrl: data,
            progress: 0,
            imageType: 'x-im/image',
            title: '',
            text: ''
        };

        // Todo - move to api

        var surface = this.context.controller.getFocusedSurface();
        surface.transaction(function(tx) {
            var body = tx.get('body');
            var node = tx.create(data);
            body.show(node.id);
        });

        //this.context.api.insertBlockNode(data.type, data);
        return data.id;
    };


    this.getUrlAndUpdateDocument = function(dom, node, replacement) {
        var newsItem = dom.querySelector('newsItem'),
            uri = dom.querySelector('itemMeta > itemMetaExtProperty[type="imext:uri"]');

        var uuid = newsItem.getAttribute('guid');

        this.context.api.router.get('/api/image/url/' + uuid + '/450')
        .done(function(url) {
            if (replacement) {
                node.setImage(
                    uuid,
                    uri ? uri.attributes['value'].value : '',
                    url
                );
            }
            else {
                node.setInitialMetaData(
                    uuid,
                    uri ? uri.attributes['value'].value : '',
                    url
                );
            }
        }.bind(this))
        .error(function(error, xhr, text) {
            // TODO: Display error message
            console.error(error, xhr, text);
        }.bind(this));
    };
};

BlockContentCommand.extend(TextframeCommand);
TextframeCommand.static.name = 'textframe';
module.exports = TextframeCommand;
