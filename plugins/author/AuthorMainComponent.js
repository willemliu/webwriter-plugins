'use strict';

var Component = require('substance/ui/Component');
var $$ = Component.$$;
var AuthorSearchComponent = require('vendor/nl.fdmg/universalsearch/UniversalSearchComponent');
var NilUUID = require('writer/utils/NilUUID');
var AuthorListComponent = require('./AuthorListComponent');
var jQuery = require('substance/util/jquery');

function AuthorMainComponent() {
  AuthorMainComponent.super.apply(this, arguments);
  this.name = 'author';
}

AuthorMainComponent.Prototype = function() {

  this.getInitialState = function() {
    return {
      existingAuthors: this.context.api.getAuthors()
    };
  }

  this.render = function() {
    var el = $$('div').ref('authorContainer').addClass('authors').append($$('h2').append(this.context.i18n.t('Author')));

    var authorSearchUrl = this.context.api.router.getEndpoint();

    var searchComponent = $$(AuthorSearchComponent, {
      existingItems: this.state.existingAuthors,
      doSearch: this.searchAuthors.bind(this),
      onSelect: this.addAuthor.bind(this),
      onCreate: this.createAuthor.bind(this),
      createAllowed: true,
      placeholderText: "Add author"
    }).ref('authorSearchComponent');

    var existingAuthorsList = $$(AuthorListComponent, {
      existingAuthors: this.state.existingAuthors,
      removeAuthor: this.removeAuthor.bind(this)
    }).ref('existingAuthorsList');

    el.append(existingAuthorsList);
    el.append(searchComponent);

    return el;
  }

  this.reloadAuthors = function() {
    this.extendState({
      existingAuthors: this.context.api.getAuthors()
    });
  }

  this.searchAuthors = function(q, cb) {
    var endpoint = this.context.api.getConfigValue(this.name, 'endpoint');

    this.extendState({ isSearching: true });

    jQuery.ajax(endpoint + q, { 'data': { 'dataType': 'json' } })
      .done(function(items) {
        console.log('<>')
        console.log(items)

        cb(null, items)
      }.bind(this))
      .fail(function(data, status, err) { console.error(err); cd(err, null)})
      .always(function() { this.extendState({ isSearching:  false }); }.bind(this));
  }

  this.addAuthor = function(author) {
    try {
      this.context.api.addAuthor(this.name, author);
      this.reloadAuthors();
    } catch (e) {
      console.log(e);
    }
  }

  this.createAuthor = function(authorTemp) {
    this.context.api.addSimpleAuthor(this.name, authorTemp.inputValue);
    this.reloadAuthors();
  }

  this.removeAuthor = function(author) {
    try {
      if (NilUUID.isNilUUID(author.uuid)) {
        this.context.api.removeAuthorByTitle(this.name, author.title);
      } else {
        this.context.api.removeAuthorByUUID(this.name, author.uuid);
      }
      this.reloadAuthors();
    } catch (e) {
      console.log(e);
    }
  }
}

Component.extend(AuthorMainComponent);
module.exports = AuthorMainComponent;