if (!String.prototype.startsWith) {
  (function() {
    'use strict';
    var defineProperty = (function() {
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var toString = {}.toString;
    var startsWith = function(search) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      if (search && toString.call(search) == '[object RegExp]') {
        throw TypeError();
      }
      var stringLength = string.length;
      var searchString = String(search);
      var searchLength = searchString.length;
      var position = arguments.length > 1 ? arguments[1] : undefined;

      var pos = position ? Number(position) : 0;
      if (pos != pos) {
        pos = 0;
      }
      var start = Math.min(Math.max(pos, 0), stringLength);
      if (searchLength + start > stringLength) {
        return false;
      }
      var index = -1;
      while (++index < searchLength) {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
          return false;
        }
      }
      return true;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'startsWith', {
        'value': startsWith,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.startsWith = startsWith;
    }
  }());
}

 var _host = 'http://www.66jjb.com',
//var _host = 'http://192.168.0.100',
    _version = '4',
    _versionName = '0.0.8',
    alertShown = false;

angular.module('jujiabao', ['ionic', 'jujiabao.controllers', 'jujiabao.services'])

.run(function($ionicPlatform, $ionicHistory, $rootScope) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $ionicPlatform.registerBackButtonAction(function(event) {
        event.preventDefault();
        if ($ionicHistory.currentStateName() === 'tab.today') {
            window.close();
            ionic.Platform.exitApp();
        } else {
            $ionicHistory.goBack();
        }
        return false;
    }, 101);

    $rootScope.badgeCount = 0;
    $rootScope.hasAd = false;
    $rootScope.imgHost = _host+'/img';
})

.constant('$ionicLoadingConfig', {
    template: '处理中...'
})

.config(function($compileProvider){
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($ionicConfigProvider) {
	$ionicConfigProvider.platform.android.tabs.position('bottom');
	$ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.views.maxCache(2);
    $ionicConfigProvider.backButton.text('后退');
    $ionicConfigProvider.backButton.previousTitleText(true);
})

.factory('httpErrorHandler', ['$q', '$injector', '$rootScope', function($q, $injector, $rootScope) {
    var httpErrorHandler = {
        request: function(config) {
            return config;
        },
        response: function(response) {
            var $ionicPopup = $injector.get('$ionicPopup'),
                $ionicLoading = $injector.get('$ionicLoading');
            if (typeof response.data.success !== 'undefined' && !response.data.success && !alertShown) {
                $ionicPopup.alert({
                    title: '提示',
                    template: response.data.msg
                });
            }

            if (response.config.url.startsWith(_host)) {
                $ionicLoading.hide();
            }

            return response;
        },
        responseError: function(rejection) {
            var $ionicPopup = $injector.get('$ionicPopup'),
                $state = $injector.get('$state'),
                $ionicLoading = $injector.get('$ionicLoading'),
                alertBox;

            if (rejection.status === 405) {
                alertBox = $ionicPopup.alert({
                    title: '提示',
                    template: '您尚未登录，请登录后继续操作'
                });

                if (typeof rejection.config.data !== 'undefined' && typeof rejection.config.data.referer !== 'undefined') {
                    $state.go('login', {referer: rejection.config.data.referer});
                } else {
                    $state.go('login', {referer: ''});
                }
            } else if (rejection.status === 500 && !alertShown) {
                alertBox = $ionicPopup.alert({
                    title: '提示',
                    template: rejection.data.msg
                });
                alertShown = true;
            } else if (!rejection.status && !alertShown) {
                alertBox = $ionicPopup.alert({
                    title: '警告',
                    template: '乖宝，您当前的网络不给力哟，请稍后重试'
                });
                alertShown = true;
            }
            $ionicLoading.hide();

            if (alertBox) {
                alertBox.then(function() {
                    alertShown = false;
                });
            }

            return $q.reject(rejection);
        }
    };
    return httpErrorHandler;
}])

.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.common['X-Requested-Agent'] = 'Phone';
    $httpProvider.defaults.headers.common['AppVersion'] = _version;
    $httpProvider.defaults.timeout = 3000;

    $httpProvider.interceptors.push('httpErrorHandler');

    $stateProvider
    .state('login', {
        url: '/login?referer',
        templateUrl: 'templates/login.html',
        controller:  'loginCtrl'
    })

    .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller:  'signupCtrl'
    })

    .state('address', {
        url: '/signup/address?data',
        templateUrl: 'templates/signup-address.html',
        controller:  'signupAddressCtrl'
    })

    .state('forget', {
        url: '/forget',
        templateUrl: 'templates/forget.html',
        controller:  'forgetCtrl'
    })

    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    .state('tab.today', {
        url: '/today',
        views: {
            'tab-today': {
                templateUrl: 'templates/item-list.html',
                controller: 'TodayCtrl'
            }
        }
    })

    .state('tab.ad-detail', {
        url: '/ad/:adId',
        views: {
            'tab-today': {
                templateUrl: 'templates/ad-detail.html',
                controller: 'AdDetailCtrl'
            }
        }
    })

    .state('tab.item-detail', {
        url: '/item/:weekId',
        views: {
            'tab-today': {
                templateUrl: 'templates/item-detail.html',
                controller: 'ItemDetailCtrl'
            }
        }
    })

    .state('tab.tomorrow', {
        url: '/tomorrow',
        views: {
            'tab-today': {
                templateUrl: 'templates/item-list.html',
                controller: 'TomorrowCtrl'
            }
        }
    })

    .state('tab.comment', {
        url: '/comment/:itemId',
        views: {
            'tab-today': {
                templateUrl: 'templates/item-comment.html',
                controller: 'ItemCommentCtrl'
            }
        }
    })

    .state('tab.cart', {
        url: '/cart',
        views: {
            'tab-cart': {
                templateUrl: 'templates/cart.html',
                controller: 'CartCtrl'
            }
        }
    })

    .state('cart-order', {
        url: '/cart/order?data',
        templateUrl: 'templates/cart-order.html',
        controller: 'CartOrderCtrl'
    })

    .state('cart-pay', {
        url: '/cart/pay?data',
        templateUrl: 'templates/cart-pay.html',
        controller: 'CartPayCtrl'
    })

    .state('cart-order-success', {
        url: '/cart/order/success?data',
        templateUrl: 'templates/order-success.html',
        controller: 'CartOrderSuccessCtrl'
    })

    .state('tab.setting', {
        url: '/setting?referer',
        views: {
            'tab-setting': {
                templateUrl: 'templates/setting.html',
                controller: 'SettingCtrl'
            }
        }
    })

    .state('tab.setting-order-list', {
        url: '/setting/order-list?status',
        views: {
            'tab-setting': {
                templateUrl: 'templates/order-list.html',
                controller: 'OrderCtrl'
            }
        }
    })

    .state('tab.setting-order-comment', {
        url: '/setting/order-comment?data',
        views: {
            'tab-setting': {
                templateUrl: 'templates/order-comment.html',
                controller: 'OrderCommentCtrl'
            }
        }
    })

    .state('tab.setting-address', {
        url: '/setting/address',
        views: {
            'tab-setting': {
                templateUrl: 'templates/address.html',
                controller: 'AddressCtrl'
            }
        }
    })

    .state('tab.setting-address-new', {
        url: '/setting/address/new',
        views: {
            'tab-setting': {
                templateUrl: 'templates/new-address.html',
                controller: 'NewAddressCtrl'
            }
        }
    })

    .state('tab.setting-about', {
        url: '/setting/about',
        views: {
            'tab-setting': {
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('tab.setting-account', {
        url: '/setting/account',
        views: {
            'tab-setting': {
                templateUrl: 'templates/account.html',
                controller: 'AccountCtrl'
            }
        }
    })

    .state('tab.setting-account-nickname', {
        url: '/setting/account/nickname',
        views: {
            'tab-setting': {
                templateUrl: 'templates/account-nickname.html',
                controller: 'AccountNicknameCtrl'
            }
        }
    })

    .state('tab.setting-account-password', {
        url: '/setting/account/password',
        views: {
            'tab-setting': {
                templateUrl: 'templates/account-password.html',
                controller: 'AccountPasswordCtrl'
            }
        }
    })

    .state('tab.bank-center', {
        url: '/setting/bank/index',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bank-center.html',
                controller: 'BankIndexCtrl'
            }
        }
    })

    .state('tab.bank-manage', {
        url: '/setting/bank/manage',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bank-manage.html',
                controller: 'BankManageCtrl'
            }
        }
    })

    .state('bank-success', {
        url: '/setting/bank/success?data',
        templateUrl: 'templates/bank-success.html',
        controller: 'BankSuccessCtrl'
    })

    .state('tab.bank-billing', {
        url: '/setting/bank/billing',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bank-billing.html',
                controller: 'BankBillingCtrl'
            }
        }
    })

    .state('tab.bank-resetpd', {
        url: '/setting/bank/resetpd',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bank-resetpd.html',
                controller: 'BankResetpdCtrl'
            }
        }
    })

    .state('tab.bank-findpd', {
        url: '/setting/bank/findpd',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bank-findpd.html',
                controller: 'BankFindpdCtrl'
            }
        }
    })
    ;

    $urlRouterProvider.otherwise('/tab/today');
})

.directive('hideTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function($scope, $el, $attrs) {
            $rootScope.hideTabs = true;
        }
    };
})

.directive('showTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function($scope, $el, $attrs) {
            $rootScope.hideTabs = false;
        }
    };
});
