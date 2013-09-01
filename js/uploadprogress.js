/**
* Upload progress jQuery plug in
*
*/


(function() {
  var $,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  $.fn.extend({
    uploadProgress: function(options) {
      var plugin;
      plugin = this;
      this.activeUploads = 0;
      this.currentFileId = 0;
      this.config = {
        url: "",
        uploadStarted: null,
        uploadsCompleted: null
      };
      this.config = $.extend(this.config, options);
      this.api = (function() {
        return {
          /**
          			* Initialise plug in
          			*
          			* @param			None
          			* @returns	void
          */

          init: function(element) {
            var self;
            self = this;
            return $(element).on('change', function(evt) {
              var error, files;
              files = evt.target.files;
              try {
                return self.processFiles(files);
              } catch (_error) {
                error = _error;
                if (typeof console !== "undefined" && console !== null) {
                  return console.log(error.stack);
                }
              }
            });
          },
          /**
          			* Process files from file input element
          			*
          			* @param	None
          			* @returns	void
          */

          processFiles: function(files) {
            var i, self, size, _i, _len, _results;
            self = this;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              i = files[_i];
              size = Math.round(i.size / 1024);
              _results.push(this.uploadFile(i, plugin.currentFileId++));
            }
            return _results;
          },
          /**
          			* Start upload of single file
          			*
          			* @param	None
          			* @returns	void
          */

          uploadFile: function(file, index) {
            var self;
            self = this;
            return (function(file, index) {
              var fileUploader, formData, xhr;
              self.activeUploads++;
              self.configCallback('uploadStarted', index, file);
              xhr = new XMLHttpRequest();
              fileUploader = xhr.upload;
              fileUploader.addEventListener("progress", function(evt) {
                var percentage, value;
                if (evt.lengthComputable) {
                  percentage = Math.round((evt.loaded * 100) / evt.total);
                  value = parseInt(percentage);
                  return self.configCallback('uploadProgress', index, file, value);
                }
              });
              fileUploader.addEventListener("load", function(evt) {
                return self.uploadFinished(file);
              });
              fileUploader.addEventListener("error", function(evt) {
                return self.uploadFinished(file, evt);
              });
              formData = new FormData();
              formData.append("" + index + "-file", file);
              xhr.open('POST', plugin.config.url);
              xhr.setRequestHeader("Cache-Control", "no-cache");
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                  return self.configCallback('requestComplete', xhr.response);
                }
              };
              if (__indexOf.call(file, 'getAsBinary') >= 0) {
                return xhr.sendAsBinary(formData);
              } else {
                return xhr.send(formData);
              }
            })(file, index);
          },
          /**
          			* A single file finished uploading
          			*
          			* @param	None
          			* @returns	void
          */

          uploadFinished: function(file, error) {
            var self;
            self = this;
            if (typeof errorEvent !== "undefined" && errorEvent !== null) {
              self.configCallback('uploadFailed', file, errorEvent);
            } else {
              self.configCallback('uploadComplete', file);
            }
            plugin.activeUploads--;
            if (plugin.activeUploads < 0) {
              plugin.activeUploads = 0;
            }
            if (plugin.activeUploads === 0) {
              return self.configCallback('uploadsCompleted', this.activeUploads);
            }
          },
          /**
          			* Call a function in the plugin config object if it exists
          			*
          			* @param	Variable 	First argument is callback name,
          			* 						subsequent arguments passed on to function
          			* @returns	void
          */

          configCallback: function() {
            var args, functionName, k, v;
            args = [];
            for (k in arguments) {
              v = arguments[k];
              args[k] = v;
            }
            functionName = args[0];
            if ((plugin.config[functionName] != null) && $.isFunction(plugin.config[functionName])) {
              args.shift();
              return plugin.config[functionName].apply(null, args);
            } else {
              return null;
            }
          }
        };
      })();
      return this.each(function(index, element) {
        return plugin.api.init(element);
      });
    }
  });

}).call(this);
