$(function() {

  App.Views.Cx = Backbone.View.extend({

    //... is a list tag.
    tagName:  "tr",

    // Cache the template function for a single item.
    template: _.template($('#collection-item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click a.destroy" : "destroy"
    },

    // The CollectionView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Collection** and a **CollectionView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this)
      this.model.bind('destroy', this.remove, this)
      this.model.bind('start:replication', this.replicationStarted, this)
      this.model.bind('start:syncFiles', this.startFileSync, this)
      this.model.bind('done:replication', this.replicationDone, this)
    },

    // Re-render the names of the collection item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()))
      return this
    },

    // Remove the item, destroy the model.
    destroy: function() {
      this.model.destroy()
      // @todo REMOVE ASSOCIATED POUCH!!
    },

    startFileSync: function() {
      this.$el.children('.sync-status').text('Files syncing...')
    },

    replicationStarted: function() {
      this.$el.children('.sync-status').text('Replication started')
    },

    replicationDone: function() {
      this.$el.children('.sync-status').text('Replication done')
    }


  })

})