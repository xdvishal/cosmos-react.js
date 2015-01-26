describe("ComponentPlayground component", function() {

  var jsdom = require('jsdom');

  // jsdom creates a fresh new window object for every test case and React needs
  // to be required *after* the window and document globals are available. The
  // var references however must be declared globally in order to be accessible
  // in test cases as well.
  var React,
      utils,
      findWithClass,
      findOneWithClass,
      Cosmos,
      ComponentPlayground,
      componentElement,
      componentInstance;

  beforeEach(function() {
    global.window = jsdom.jsdom().createWindow('<html><body></body></html>');
    global.document = global.window.document;
    global.navigator = global.window.navigator;

    React = require('react/addons');
    utils = React.addons.TestUtils;
    $ = require('jquery');
    Cosmos = require('../../build/cosmos.js');

    findWithClass = utils.scryRenderedDOMComponentsWithClass;
    findOneWithClass = utils.findRenderedDOMComponentWithClass;

    ComponentPlayground = Cosmos.components.ComponentPlayground;

    // Clean up previous component setup
    componentElement = null;
    componentInstance = null;
  });

  describe("render", function() {

    it("should render component list", function() {
      var props = {
        fixtures: {
          FirstComponent: {},
          SecondComponent: {}
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var components = findWithClass(componentInstance, 'component');

      expect(components.length).toBe(2);

      var names = findWithClass(componentInstance, 'component-name');

      expect(names.length).toBe(2);
      expect($(names[0].getDOMNode()).text()).toBe('FirstComponent');
      expect($(names[1].getDOMNode()).text()).toBe('SecondComponent');
    });

    it("should render fixtures under each component (with spaces)", function() {
      var props = {
        fixtures: {
          FirstComponent: {
            'blank-state': {},
            'error-state': {},
            'available-state': {}
          },
          SecondComponent: {
            'simple-state': {}
          }
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var fixtureGroups = findWithClass(componentInstance,
                                        'component-fixtures');

      expect(fixtureGroups.length).toBe(2);

      var $first = $(fixtureGroups[0].getDOMNode()),
          $second = $(fixtureGroups[1].getDOMNode());

      expect($first.find('li').length).toBe(3);
      expect($second.find('li').length).toBe(1);

      expect($first.find('li:nth-child(1)').text()).toBe('blank state');
      expect($first.find('li:nth-child(2)').text()).toBe('error state');
      expect($first.find('li:nth-child(3)').text()).toBe('available state');

      expect($second.find('li:nth-child(1)').text()).toBe('simple state');
    });

    it("should add class (only) to expanded components", function() {
      var props = {
        fixtures: {
          FirstComponent: {},
          SecondComponent: {},
          ThirdComponent: {}
        },
        state: {
          expandedComponents: ['FirstComponent', 'ThirdComponent']
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var expandedComponents = findWithClass(componentInstance,
                                             'expanded-component');

      expect(expandedComponents.length).toBe(2);

      var name1 = findOneWithClass(expandedComponents[0], 'component-name'),
          name2 = findOneWithClass(expandedComponents[1], 'component-name');

      expect($(name1.getDOMNode()).text()).toBe('FirstComponent');
      expect($(name2.getDOMNode()).text()).toBe('ThirdComponent');
    });

    it("should generate urls with fixture paths", function() {
      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {}
          }
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var $fixtureLink = $(componentInstance.getDOMNode())
                         .find('.component-fixtures a');

      var href = $fixtureLink.attr('href'),
          props = Cosmos.serialize.getPropsFromQueryString(href.substr(1));

      expect(props).toEqual({
        fixturePath: 'MyComponent/here-i-am'
      });
    });
  });

  describe("children", function() {

    var createElementSpy;

    beforeEach(function() {
      createElementSpy = spyOn(Cosmos, 'createElement');
    });

    it("should pass down fixture contents to preview child", function() {
      var referencedObj = {};

      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {
              shineBrightLikeA: 'diamond',
              myPrecious: referencedObj
            }
          }
        },
        fixturePath: 'MyComponent/here-i-am'
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var childProps = createElementSpy.calls.mostRecent().args[0];

      expect(childProps.shineBrightLikeA).toBe('diamond');
      expect(childProps.myPrecious).toBe(referencedObj);
    });

    it("should pass down component name to preview child", function() {
      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {}
          }
        },
        fixturePath: 'MyComponent/here-i-am'
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var childProps = createElementSpy.calls.mostRecent().args[0];

      expect(childProps.component).toBe('MyComponent');
    });

    it("should pass down router instance to preview child", function() {
      var routerInstance = {};

      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {}
          }
        },
        fixturePath: 'MyComponent/here-i-am',
        router: routerInstance
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      var childProps = createElementSpy.calls.mostRecent().args[0];

      expect(childProps.router).toBe(routerInstance);
    });
  });

  describe("state", function() {

    beforeEach(function() {
      // Children shouldn't be rendered
      spyOn(Cosmos, 'createElement');
    });

    it("should default to no expanded components", function() {
      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {}
          }
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      expect(componentInstance.state.expandedComponents).toEqual([]);
    });

    it("should expand component from selected fixture", function() {
      var props = {
        fixtures: {
          MyComponent: {
            'here-i-am': {}
          }
        },
        fixturePath: 'MyComponent/here-i-am'
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      expect(componentInstance.state.expandedComponents)
            .toEqual(['MyComponent']);
    });
  });

  describe("events", function() {

    it("should expand component on click", function() {
      var props = {
        fixtures: {
          MyComponent: {}
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      utils.Simulate.click(
        componentInstance.refs.MyComponentButton.getDOMNode());

      expect(componentInstance.state.expandedComponents)
            .toEqual(['MyComponent']);
    });

    it("should contract expanded component on click", function() {
      var props = {
        fixtures: {
          MyComponent: {},
          OtherComponent: {}
        },
        state: {
          expandedComponents: ['MyComponent', 'OtherComponent']
        }
      };

      componentElement = React.createElement(ComponentPlayground, props);
      componentInstance = utils.renderIntoDocument(componentElement);

      utils.Simulate.click(
        componentInstance.refs.MyComponentButton.getDOMNode());

      expect(componentInstance.state.expandedComponents)
            .toEqual(['OtherComponent']);
    });
  });
});
