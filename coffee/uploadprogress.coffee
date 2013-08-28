###*
* Upload progress jQuery plug in
*
###

$ = jQuery
$.fn.extend

	uploadProgress: (options) ->
		plugin = @

		@activeUploads = 0
		@currentFileId = 0;
		@config =
			url: ""
			uploadStarted: null,
			uploadsCompleted: null

		@config = $.extend @config, options


		###*
		* Initialise plug in
		*
		* @param			None
		* @returns	void
		###
		init: (element) ->
			self = @

			$(element).live 'change', (evt) ->
				files = evt.target.files
				try
					self.processFiles(files)
				catch error
					console.log error.stack if console?


		###*
		* Process files from file input element
		*
		* @param	None
		* @returns	void
		###
		processFiles: (files) ->
			self = @

			for i in files
				size = Math.round(i.size / 1024)
				@uploadFile i, plugin.currentFileId++


		###*
		* Start upload of single file
		*
		* @param	None
		* @returns	void
		###
		uploadFile: (file, index) ->
			self = @

			do (file, index) ->
				self.activeUploads++

				self.configCallback('uploadStarted', index, file);

				xhr = new XMLHttpRequest()
				fileUploader = xhr.upload

				fileUploader.addEventListener "progress", (evt) ->
					if evt.lengthComputable
						percentage = Math.round((evt.loaded * 100) / evt.total)
						value = parseInt(percentage)
						self.configCallback('uploadProgress', index, file, value)

				fileUploader.addEventListener "load", (evt) ->
					self.uploadFinished(file)

				fileUploader.addEventListener "error", (evt) ->
					self.uploadFinished(file, evt)

				formData = new FormData()
				formData.append "#{index}-file", file

				xhr.open 'POST', plugin.config.url
				xhr.setRequestHeader "Cache-Control", "no-cache"
				xhr.onreadystatechange = ->
					if xhr.readyState == 4 && xhr.status == 200
						self.configCallback('requestComplete', xhr.response)
				if 'getAsBinary' in file
					xhr.sendAsBinary(formData)
				else
					xhr.send(formData)


		###*
		* A single file finished uploading
		*
		* @param	None
		* @returns	void
		###
		uploadFinished: (file, error) ->
			self = @

			if errorEvent?
				self.configCallback('uploadFailed', file, errorEvent)
			else
				self.configCallback('uploadComplete', file)

			plugin.activeUploads--
			if plugin.activeUploads < 0
				plugin.activeUploads = 0

			if plugin.activeUploads == 0
				self.configCallback('uploadsCompleted', @activeUploads);


		###*
		* Call a function in the plugin config object if it exists
		*
		* @param	Variable 	First argument is callback name,
		* 						subsequent arguments passed on to function
		* @returns	void
		###
		configCallback: ->
			args = []
			for k,v of arguments
				args[k] = v

			functionName = args[0]
			if plugin.config[functionName]? && $.isFunction plugin.config[functionName]
				args.shift()
				return plugin.config[functionName].apply(null, args)
			else
				null


		#---------------------------------------------------------------------
		# Plug in entry point
		#---------------------------------------------------------------------
		return @each (index, element) ->
			plugin.init element
