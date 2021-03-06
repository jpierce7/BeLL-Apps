$(function () {

	App.Views.ResourceForm = Backbone.View.extend({

		className: "form",
		id: 'resourceform',
		hide: false,
		events: {
			"click .save": "saveForm",
			"click #cancel": function () {
				window.history.back()
			},
			"click #add_newCoellection": function () {
				App.Router.AddNewSelect('Add New')
			}
		},

		template: _.template($('#template-form-file').html()),

		render: function () {
			var vars = {}
			if (_.has(this.model, 'id')) {
				vars.header = 'Details "' + this.model.get('title') + '"';
				var tempAttachments = this.model.get('_attachments');
				var fields = _.map(
					_.pairs(tempAttachments),
					function (pair) {
						return {
							key: pair[0],
							value: pair[1]
						};
					}
				);
				vars.resourceAttachments = fields;
				vars.resourceTitle = this.model.get('title');
				vars.resourceUrl = this.model.get('url');


			}
			else {
				vars.header = 'New Resource';
				vars.resourceAttachments = "No File Selected.";
				vars.resourceUrl = "";
			}

			// prepare the form
			this.form = new Backbone.Form({
				model: this.model
			})
			this.form.render()
			this.form.fields['uploadDate'].$el.hide()
			if (this.edit == false) {
				this.form.fields['addedBy'].$el.val($.cookie('Member.login'))
			}
			this.form.fields['addedBy'].$el.attr("disabled", true)
			this.form.fields['averageRating'].$el.hide()
			var that = this
			if (_.has(this.model, 'id')) {
				if (this.model.get("Level") == "All") {
					that.hide = true
				}
			}
			// @todo Why won't this work?
			vars.form = "" //$(this.form.el).html()
			this.$el.html(this.template(vars))
				// @todo this is hackey, should be the following line or assigned to vars.form
			$('.fields').html(this.form.el)
			this.$el.append('<button class="btn btn-success" id="add_newCoellection" >Add New</button>')
			$('#progressImage').hide();
			//$this.$el.children('.fields').html(this.form.el) // also not working

			return this
		},
		saveForm: function () {

			// @todo validate 
			//if(this.$el.children('input[type="file"]').val() && this.$el.children('input[name="title"]').val()) {
			// Put the form's input into the model in memory
			var previousTitle = this.model.get("title")
			var isEdit = this.model.get("_id")
			var formContext = this
			this.form.commit()

			if (this.model.get('openWith') == 'PDF.js') {
				this.model.set('need_optimization', true)
			}
			// Send the updated model to the server
			var newTitle = this.model.get("title")
			if (this.model.get("title").length == 0) {
				alert("Resource Title is missing")
			}
			else if (this.model.get("subject") == null) {
				alert("Resource Subject is missing")
			}
			else if (this.model.get("Level") == null) {
				alert("Resource Level is missing")
			}
			else if (this.model.get("Tag") == null) {
				alert("Resource Tag is missing")
			}
			else {
				if (isEdit) {
					var addtoDb = true
					if (previousTitle != newTitle) {
						if (this.DuplicateTitle()) {
							addtoDb = false
						}
					}
					if (addtoDb) {
						this.model.save(null, {
							success: function (res) {

								if ($('input[type="file"]').val()) {
									formContext.model.unset('_attachments')
									App.startActivityIndicator()
									formContext.model.saveAttachment("form#fileAttachment", "form#fileAttachment #_attachments", "form#fileAttachment .rev")

								}
								else {
									window.history.back()
								}
							}
						})
					}
				}
				else {
					if (!this.DuplicateTitle()) {
						this.model.set("sum", 0)
						this.model.set("timesRated", 0)
						this.model.save(null, {
							success: function (res) {
								if ($('input[type="file"]').val()) {
									App.startActivityIndicator()
									formContext.model.saveAttachment("form#fileAttachment", "form#fileAttachment #_attachments", "form#fileAttachment .rev")

								}
								else {
									window.history.back()
								}
							}
						})
					}
				}
			}
			this.model.on('savedAttachment', function () {
				this.trigger('processed')
			}, formContext.model)



		},
		DuplicateTitle: function () {
			var checkTitle = new App.Collections.Resources()
			checkTitle.title = this.model.get("title")
			checkTitle.fetch({
				async: false
			})
			checkTitle = checkTitle.first()
			if (checkTitle != undefined)
				if (checkTitle.toJSON().title != undefined) {
					alert("Title already exist")
					return true
				}
			return false
		},
		statusLoading: function () {
			this.$el.children('.status').html('<div style="display:none" class="progress progress-striped active"> <div class="bar" style="width: 100%;"></div></div>')
		}

	})

})