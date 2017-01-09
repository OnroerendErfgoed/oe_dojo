define([
    'intern!object', 'intern/chai!assert', 'require',
    'intern/dojo/node!dijit-intern-helper/helpers/dijit',
    'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (registerSuite, assert, require, dijit, pollUntil) {
    registerSuite({
        name: 'Dijit Functional Test',

        'functional test': function () {
            var sliderSize;
            var url = require.toUrl('tests/functional/example.html');

            return this.remote.get(url)
                .setFindTimeout(10000)
                .setPageLoadTimeout(8000)
                .setExecuteAsyncTimeout(10000)
                //.then(pollUntil('return window.ready', 5000))
                // Obtain widget DOM node via the dijit registry
                .then(dijit.nodeById('titlePane', 'titleBarNode'))
                // Explicitly set the Command chain's context to the node
                .click()

                // wait for title pane to expand, default duration is 200ms
                .sleep(500)

                .then(dijit.nodeById('yesButton', 'focusNode'))
                .click()
                .then(dijit.nodeById('horizontalSlider', 'domNode'))
                .getSize()
                .then(function (size) {
                    sliderSize = size;
                })
                .then(dijit.nodeById('horizontalSlider', 'sliderHandle'))
                .then(function (node) {
                    // Drag slider all the way to the right
                    return this.parent
                        .moveMouseTo(node)
                        .pressMouseButton()
                        .moveMouseTo(sliderSize.width, 0)
                        .releaseMouseButton();
                })
                // get the form value to compare it with the expected value
                .then(dijit.getProperty('testForm', 'value'))
                .then(function (formValue) {
                    assert.deepEqual(formValue, {
                        horizontalSlider: 10,
                        answer: 'yes'
                    });
                });
        }
    });
});