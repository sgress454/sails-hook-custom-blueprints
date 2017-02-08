/**
 * Module dependencies
 */

 var includeAll = require('include-all');

/**
 * sails-hook-custom-blueprints hook
 *
 * @description :: A hook to re-enable custom blueprint definitions in Sails 1.x.
 * @docs        :: http://sailsjs.com/documentation/concepts/blueprints
 */

module.exports = function defineSailsHookCustomBlueprintsHook(sails) {

  var hook;

  return {

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
    initialize: function (done) {

      hook = this;

      // If the blueprints hook isn't active, this hook isn't really relevant.
      if (!sails.hooks.blueprints) {
        sails.log.debug('Skipping activation of `sails-hook-custom-blueprints` hook since core blueprints hook is disabled!');
        return done();
      }

      // After the blueprints hook loads, load and register any custom blueprint actions.
      sails.after('hook:blueprints:loaded', function() {
        hook.loadAndRegisterActions(done);
      });

    },

    loadAndRegisterActions: function(done) {

      // Load blueprint actions from the configured folder (defaults to `api/blueprints`)
      includeAll.optional({
        dirname: sails.config.paths.blueprints,
        filter: /^([^.]+)\.(?:(?!md|txt).)+$/,
        depth: 1,
        replaceExpr : /^.*\//,
      }, function(err, files) {
        // Loop through all of the loaded models.
        _.each(_.keys(sails.models), function(modelIdentity) {
          // Loop through all of the loaded blueprints and register an action for each one
          // that's specific to this model, e.g. `user/find`.
          _.each(files, function(blueprintAction, blueprintName) {
            sails.registerAction(blueprintAction, modelIdentity + '/' + blueprintName, true);
          });
        });
        return done();
      });

    }

  };

};
