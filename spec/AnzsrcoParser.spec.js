describe('AnzsrcoParser', function() {

	var FOR_RDF = './spec/fixtures/for.rdf';
	var SEO_RDF = './spec/fixtures/seo.rdf';
	var TOA_RDF = './spec/fixtures/toa.rdf';

	var getTestRdf = function(rdfLocation) {
		var testRdf = null;
		$.ajax({
			url: rdfLocation,
			async: false,
			dataType: 'text',
			success: function(data, textStatus, jqXHR) {
				testRdf = data;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				throw errorThrown;
			}
		});
		return testRdf;
	};

	it('should be instantiable', function() {
		var parser = new AnzsrcoParser();
		expect(parser).not.toBe(null);
	});

	describe('valid SKOS schemas', function() {

		var doTest = function(rdfLocation) {
			var parser = new AnzsrcoParser();
			var rdf = getTestRdf(rdfLocation);
			expect(rdf).not.toBeNull();
			expect(rdf.length).toBeGreaterThan(1000);

			parser.loadRdf(rdf);

			expect(typeof(parser.getKnownTypes)).toBe('function');
			expect(typeof(parser.getByType)).toBe('function');

			expect(parser.getKnownTypes()).not.toEqual([]);
			_.each(parser.getKnownTypes(), function(v) {
				var descsOfType = parser.getByType(v);
				expect(descsOfType.length).toBeGreaterThan(0);
				_.each(descsOfType, function(desc) {
					expect(typeof(desc.about)).toBe('string');
					expect(typeof(desc.label)).toBe('string');
					expect(typeof(desc.scheme)).toBe('string');
				});
			});

			return parser;
		};

		it('should be able to load the FOR RDF', function() {
			var parser = doTest(FOR_RDF);
		});

		it('should be able to load the SEO RDF', function() {
			var parser = doTest(SEO_RDF);
		});

		it('should be able to load the TOA RDF', function() {
			var parser = doTest(TOA_RDF);
		});
	});

	it('should be able to search labels', function() {
		var parser = new AnzsrcoParser();

		var rdf = getTestRdf(FOR_RDF);
		expect(rdf).not.toBeNull();
		parser.loadRdf(rdf);

		expect(typeof(parser.getByLabel)).toBe('function');
		var results = parser.getByLabel(/water/i);
		expect(results.length).toBe(6);

		window.forParser = parser;
	});

	it('should be able to build trees', function() {
		var parser = new AnzsrcoParser();

		var rdf = getTestRdf(FOR_RDF);
		expect(rdf).not.toBeNull();
		parser.loadRdf(rdf);

		expect(typeof(parser.getByLabel)).toBe('function');
		var results = parser.getByLabel(/economics/i);
		expect(results.length).toBeGreaterThan(0);

		var tree = parser.buildTree(results);

		var searchTree = function(tree, label) {
			if (tree == undefined)
				return false;
			var type = null;
			for (var i = 0; i < tree.length; i++) {
				var element = tree[i];
				if (type == null) {
					type = element.type;
				} else {
					expect(element.type).toEqual(type);
				}
				if (element.label == label)
					return true;
				if (searchTree(element.children,label))
					return true;
			}
			return false;
		};


		for (var i = 0; i < results.length; i++) {
			expect(searchTree(tree, results[i].label)).toBeTruthy();
		}


		window.forParser = parser;
	});

});


