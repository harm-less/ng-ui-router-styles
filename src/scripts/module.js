(function (angular, window) {

  'use strict';

  var stylesLoadedEventName = 'stylesLoaded';

  var nextResourceId = 1;
  var addedLinkElements = [];
  var $q;

  angular.module('betsol.uiRouterStyles', ['ui.router'])

    /**
     * Using data decorator to normalize style definitions.
     */
    .config(function ($stateProvider) {
      $stateProvider.decorator('data', function (state, parent) {
        var data = parent(state);
        if ('undefined' !== typeof data.css) {
          data.css = normalizeStyleDefinitions(data.css);
        }
        return data;
      });
    })

    .run(function ($rootScope, $state, $injector) {

      // Making $q globally available to the module.
      $q = $injector.get('$q');

      /**
       * Updating styles when route starts to change.
       */
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        // Building chain of states from top to bottom.
        var states = [];
        var state = toState;
        do {
          states.unshift(state);
          state = (state.parent ? $state.get(state.parent) : null);
        } while (state);

        // Merging style definitions from all states together.
        var definitions = {};
        angular.forEach(states, function (state) {
          if (state.data && state.data.css) {
            angular.extend(definitions, state.data.css);
          }
        });

        // Removing all previously loaded styles first.
        clearStyleDefinitions();

        // Adding required styles one-by-one.
        var promises = [];
        angular.forEach(definitions, function (definition) {
          promises.push(
            loadStyleDefinition(definition)
          );
        });

        // Firing an event when all styles are loaded.
        $q.all(promises).then(function () {
          $rootScope.$broadcast(stylesLoadedEventName);
        });

      });

    })

    /**
     * Service could be used for configuration and API calls.
     */
    .provider('uiRouterStyles', function () {
      var service = {};
      var provider = {
        $get: function () {
          return service;
        }
      };
      return provider;
    })

  ;


  /**
   * Normalizes style definitions specified by user in the state configuration.
   *
   * @param {*} definitions
   *
   * @returns {object}
   */
  function normalizeStyleDefinitions (definitions) {

    if ('string' === typeof definitions) {
      definitions = [definitions];
    }

    var normalizedDefinitions = {};

    // Making sure each entry has a unique resource ID.
    angular.forEach(definitions, function (definition, key) {

      if ('string' === typeof definition) {

        // Converting string definition to object.
        definition = {
          url: definition
        };

      } else if ('object' === typeof definition) {

        if (!definition.url) {
          log('state style definition must have URL specified');
          return;
        }

        // Using specified ID as new object key.
        if (definition.id) {
          key = definition.id;
        }

      }

      // Using custom unique resource ID instead of simple array index.
      if (isInt(key)) {
        key = generateResourceId();
      }

      definition.id = key;

      normalizedDefinitions[key] = definition;

    });

    return normalizedDefinitions;
  }

  function isInt (value) {
    return Number(value) === value && value % 1 === 0;
  }

  function generateResourceId () {
    return '@resource~' + nextResourceId++;
  }

  function log (message) {
    console.log('betsol-ng-ui-router-styles: ' + message);
  }

  /**
   * Adds <link> element to the page according to the specified style definition.
   *
   * @param {object} definition
   *
   * @return {Promise}
   */
  function loadStyleDefinition (definition) {

    var deferred = $q.defer();

    if (window.loadStylesheet) {
      var linkElement = window.loadStylesheet(definition.url, function () {
        deferred.resolve();
      });
      // Maintaining convenient index of all added link elements.
      addedLinkElements.push(linkElement);
    } else {
      log('betsol-load-stylesheet module must be loaded');
      deferred.reject();
    }

    return deferred.promise;

  }

  /**
   * Removes all previously added <link> elements.
   */
  function clearStyleDefinitions () {
    angular.forEach(addedLinkElements, function (linkElement) {
      linkElement.remove();
    });
    addedLinkElements = [];
  }

})(angular, window);
