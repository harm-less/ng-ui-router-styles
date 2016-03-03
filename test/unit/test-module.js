describe('Module', function () {

  //==============//
  // INITIALIZING //
  //==============//

  beforeEach(module('betsol.uiRouterStyles'));

  var serviceProvider;
  beforeEach(module(function (_uiRouterStylesProvider_) {
    serviceProvider = _uiRouterStylesProvider_;
  }));

  var service;
  beforeEach(inject(function (_uiRouterStyles_) {
    service = _uiRouterStyles_;
  }));


  //=========//
  // TESTING //
  //=========//

  it('service provider should be present', function () {
    expect(serviceProvider).to.be.an('object');
  });

  it('service should be present', function () {
    expect(service).to.be.an('object');
  });

});
