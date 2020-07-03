const Constants = {
	DOCKERHUB: "https://hub.docker.com/",
	DOCKERHUB_SEARCH: "https://hub.docker.com/api/content/v1/products/search",
	DOCKER_COMPOSE_REFERENCE_V3: "https://docs.docker.com/compose/compose-file/",
	DOCKERHUB_COMMUNITY_SEARCH: "https://hub.docker.com/api/content/v1/products/search/?q=node&source=community",
	ANOTHER_ONE: "https://search-api.s.us-east-1.aws.dckr.io/v2/search/repositories?is_official=false&page=2&query=hello",
	DOCKERHUB_STORE_SEARCH: "https://store.docker.com/api/content/v1/products/search",
	DOCKER_HOST: "http://127.0.0.1:3001",
	tags: {
		OFFICIAL: "https://hub.docker.com/api/nautilus/v1/repositories/summaries/library/",
		COMMUNITY: "https://hub.docker.com/v2/repositories/"
	},
	attributes: {
		services: {
			mapEntries: ['environment', 'labels', 'loggingOptions', 'buildArgs',
					 	 'buildLabels', 'deployLabels', 'deployPlacementConstraints'],

		 	mapEntriesAlt: [
		 		{
		 			variable: 'environment',
		 			format: "any",
		 			separator: '=',
		 		},
		 		{
		 			variable: 'labels',
		 			format: "any",
		 			separator: '=',
		 		},


		 	],

		 	mapPathEntries: ['environment', 'labels', 'devices', 'logging.options', 'build.args',
					 	 	 'build.labels', 'deploy.labels', 'deploy.placement.preferences',
					 	 	 'deploy.placement.constraints'],

   		    singleEntries: ['dns', 'dns_search', 'env_file', 'expose', 'external_links',
		    				'cap_add', 'cap_drop', 'devices', 'tmpfs', 'buildCache_from'],
		    				
			
			singleArrayEntries: ['dns', 'dns_search', 'env_file', 'tmpfs'],

			commands: ['command', 'entrypoint', 'healthcheck.test'],
		},

		networks: {
			mapEntries: ['driver_opts', 'labels']
		},

		volumes: {
			mapEntries: ['driver_opts', 'labels']
		}
	},
	patterns: {
		SIGNAL: "SIG[A-Z0-9\\+\\-]+",
		DURATION: "(\\d+h)?([1-9]\\d*(\\.\\d+)?m)?(\\d+(\\.\\d+)?s)?([1-9]\\d{0,2}?ms)?",
		SIZE: "\\d+([kK][bB]?|[mM][bB]?|[gG][bB]?|[bB])",
		PERCENTAGE: "(0(\\.\\d{1,2})?)|1",
		IMAGE: "([a-z0-9.-]+\\/)?[a-z0-9.-]+(:[a-z0-9.-]+)?",
		UNIX_PERMISSIONS: "[0-7]{4}",
		PID: "host|(service|container):\\w+"
	},
	messages: {
		signal: "Must be a valid unix signal",
		duration: "Must be a valid duration string (supported units us, ms, s, m, h)",
		size: "Must be a valid size string",
		percentage: "Must be a percentage value",
		image: "Must be a valid image id",
		perimissions: "Must be an octal value with 4 places",
		pid: "Must be a valid pid string"
	},
	paths: {
		DEFAULT_PROJECT_DIR: 'projects',
		SECRET_FOLDER: '.docker-composer',
		PROJ_NAME: 'map.xml',
		TMP_DOCKER_COMPOSE: 'docker-composer-tmp.yml',
		VALID_FILE_EXTENSIONS: ['yml', 'yaml']
	},
	colors:{
		off: '#383838',
		starting: 'blue',
		running: 'limegreen',
		warning: '#fccd00'
	},
	multipliers: {
		1: 'K',
		2: 'M',
		3: 'B',
	},
	versions: [ '3.8', '3.7', '3.6', '3.5', '3.4', '3.3', '3.2', '3.1', '3' ] 
}

export default Object.freeze(Constants);