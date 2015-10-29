angular.module('jujiabao.controllers', [])

.controller('loginCtrl', function($scope, $state, $stateParams, $ionicPopup, $localstorage, LoginService) {
    $scope.login = function(user) {
        if (!user || !user.mobile || !user.password) {
            $ionicPopup.alert({
                title: '登录错误',
                template: '手机号或者密码不能为空',
                okText: '关闭'
            });
        } else {
            LoginService.doLogin({user: user.mobile, pass: user.password}, function(data) {
                if (data.success) {
                    $localstorage.set('token', data.extend);
                    if ($stateParams.referer) {
                        $state.go($stateParams.referer);
                    } else {
                        $state.go('tab.today');
                    }
                }
            });
        }
    };
})

.controller('signupCtrl', function($scope, $timeout, $ionicModal, $ionicPopup, SignupService) {
    var timeoutId = [],
        smsCountDown = 90;

    $scope.disableSms = false;
    $scope.data = {};
    $scope.isValid = false;
    $scope.onTimeout = function() {
        if (smsCountDown <= 0) {
            for (var i = timeoutId.length - 1; i>= 0; i--) {
                $timeout.cancel(timeoutId[i]);
            };
            $scope.smsCountDown = null;
            $scope.disableSms = false;
            return false;
        }

        smsCountDown -= 1;
        $scope.smsCountDown = smsCountDown;
        timeoutId.push($timeout($scope.onTimeout, 1000));
    }
    $scope.getSms = function(data) {
        if (!data || !data.mobile) {
            $ionicPopup.alert({
                title: '注册错误',
                template: '手机号不能为空',
                okText: '关闭'
            });
        } else {
            SignupService.getSms({mobile: data.mobile}, function(data) {
                if (data.success) {
                    $scope.disableSms = true;
                    timeoutId.push($timeout($scope.onTimeout, 1000));
                }
            });
        }
    };

    $scope.verifyForm = function() {
        if ($scope.data.mobile && $scope.data.code && $scope.data.password &&
            $scope.data.nickname && $scope.data.agreement) {
            $scope.isValid = true;
        } else {
            $scope.isValid = false;
        }
    }

    $scope.goSignupAddress = function() {
        document.location.href = '#/signup/address?data='+JSON.stringify($scope.data);
    };

    $ionicModal.fromTemplateUrl('templates/agreement.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.getAgreement = function() {
        SignupService.getAgreement(function(data) {
            $scope.data.agreement = data;
            $scope.modal.show();
        });
    };

    $scope.closeAgreement = function() {
        $scope.modal.hide();
    };
})

.controller('signupAddressCtrl', function($scope, $state, $stateParams, $ionicModal, $ionicPopup, $localstorage, SignupService, LoginService, MemberService) {
    var data = JSON.parse($stateParams.data);

    $ionicModal.fromTemplateUrl('templates/address-section.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.$on('modal.hidden', function() {
        $scope.hasRegion = true;
    });

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.levelOneRegion = {id: 0, name: '选择地区'};
    $scope.levelTwoRegion = null;
    $scope.levelThreeRegion = null;
    $scope.levelFourRegion = null;
    $scope.levelFiveRegion = null;
    $scope.currentLevel = 1;
    $scope.address = {};
    $scope.addressValid = false;

    $scope.selectRegion = function(region) {
        $scope.addressValid = false;
        switch($scope.currentLevel) {
            case 1:
                $scope.levelOneRegion = region;
                break;
            case 2:
                $scope.levelTwoRegion = region;
                break;
            case 3:
                $scope.levelThreeRegion = region;
                break;
            case 4:
                $scope.levelFourRegion = region;
                break;
            case 5:
                $scope.levelFiveRegion = region;
                break;
            default:
                break;
        }

        if (region && !parseInt(region.hasChild)) {
            if ($scope.currentLevel == 2) {
                $scope.levelThreeRegion = null;
            } else if ($scope.currentLevel == 3) {
                $scope.levelFourRegion = null;
            } else if ($scope.currentLevel == 4) {
                $scope.levelFiveRegion = null;
            }
            $scope.addressValid = true;
            $scope.modal.hide();
            return false;
        }
        $scope.currentLevel += 1;
        MemberService.createAddress(region, function(data) {
            switch($scope.currentLevel) {
                case 1:
                    $scope.regionTitle = '选择地区';
                    break;
                case 2:
                    $scope.regionTitle = '选择商圈';
                    break;
                case 3:
                    $scope.regionTitle = '选择大楼';
                    break;
                case 4:
                    $scope.regionTitle = '选择楼区';
                    break;
                case 5:
                    $scope.regionTitle = '选择单元';
                    break;
                default:
                    $scope.regionTitle = '选择地区';
                    break;
            }

            $scope.section = data;
            $scope.modal.show();
        });
    };

    $scope.getAddressSection = function(level, region) {
        switch(level) {
            case 1:
                $scope.regionTitle = '选择地区';
                break;
            case 2:
                $scope.regionTitle = '选择商圈';
                break;
            case 3:
                $scope.regionTitle = '选择大楼';
                break;
            case 4:
                $scope.regionTitle = '选择楼区';
                break;
            case 5:
                $scope.regionTitle = '选择单元';
                break;
            default:
                $scope.regionTitle = '选择地区';
                break;
        }
        $scope.currentLevel = level;

        MemberService.createAddress(region, function(data) {
            $scope.section = data;
            $scope.modal.show();
        });
    };

    $scope.signup = function() {
        if (!$scope.address || !$scope.address.manualAddress || !$scope.address.floor ||
            !$scope.address.contact || !$scope.address.mobile || !$scope.addressValid) {
            $ionicPopup.alert({
                title: '保存地址错误',
                template: '您的地址选择不正确，并且需要填入联系人，电话，楼层和详细地址',
                okText: '关闭'
            });
        } else if ($scope.address.mobile.length > 11) {
            $ionicPopup.alert({
                title: '手机错误',
                template: '您的的手机号码长度不正确',
                okText: '关闭'
            });
        } else {
            var region = [];
            if ($scope.levelOneRegion.id) {
                region.push({
                    id: $scope.levelOneRegion.id,
                    name: $scope.levelOneRegion.name,
                    type: $scope.levelOneRegion.type
                });
            }
            if ($scope.levelTwoRegion) {
                region.push({
                    id: $scope.levelTwoRegion.id,
                    name: $scope.levelTwoRegion.name,
                    type: $scope.levelTwoRegion.type
                });
            }
            if ($scope.levelThreeRegion) {
                region.push({
                    id: $scope.levelThreeRegion.id,
                    name: $scope.levelThreeRegion.name,
                    type: $scope.levelThreeRegion.type
                });
            }
            if ($scope.levelFourRegion) {
                region.push({
                    id: $scope.levelFourRegion.id,
                    name: $scope.levelFourRegion.name,
                    type: $scope.levelFourRegion.type
                });
            }
            if ($scope.levelFiveRegion) {
                region.push({
                    id: $scope.levelFiveRegion.id,
                    name: $scope.levelFiveRegion.name,
                    type: $scope.levelFiveRegion.type
                });
            }

            SignupService.doSignup({
                mobile: data.mobile, code: data.code, password: data.password, nickname: data.nickname,
                region: JSON.stringify(region), address: $scope.address
            }, function(signupRes) {
                if (signupRes.success) {
                    LoginService.doLogin({user: data.mobile, pass: data.password}, function(loginRes) {
                        if (loginRes.success) {
                            $localstorage.set('token', loginRes.extend);
                            $state.go('tab.today');
                        }
                    });
                }
            });
        }
    };
})

.controller('forgetCtrl', function($scope, $state, $timeout, $ionicPopup, ForgetService) {
    var timeoutId = [],
        smsCountDown = 90;

    $scope.onTimeout = function() {
        if (smsCountDown <= 0) {
            for (var i = timeoutId.length - 1; i>= 0; i--) {
                $timeout.cancel(timeoutId[i]);
            };
            $scope.smsCountDown = null;
            $scope.disableSms = false;
            return false;
        }

        smsCountDown -= 1;
        $scope.smsCountDown = smsCountDown;
        timeoutId.push($timeout($scope.onTimeout, 1000));
    }
    $scope.getSms = function(data) {
        if (!data || !data.mobile) {
            $ionicPopup.alert({
                title: '注册错误',
                template: '手机号不能为空',
                okText: '关闭'
            });
        } else {
            ForgetService.getSms({mobile: data.mobile}, function(data) {
                if (data.success) {
                    $scope.disableSms = true;
                    timeoutId.push($timeout($scope.onTimeout, 1000));
                }
            });
        }
    };

    $scope.forget = function(data) {
        if (!data || !data.mobile || !data.code || !data.password) {
            $ionicPopup.alert({
                title: '注册错误',
                template: '手机号，验证码，密码不能为空',
                okText: '关闭'
            });
        } else {
            ForgetService.reset({
                mobile: data.mobile, code: data.code, password: data.password
            }, function(resetRes) {
                if (resetRes.success) {
                    $ionicPopup.alert({
                        title: '成功',
                        template: '密码重置成功',
                        okText: '关闭'
                    });
                   $state.go('login');
                }
            });
        }
    };
})

.controller('TodayCtrl', function($scope, $state, $ionicPopup, $rootScope, $cordovaDevice, $timeout, $interval, $ionicSlideBoxDelegate, $localstorage, VersionService, DataListService, CartService) {
    $scope.title = '今日菜谱';

    $scope.imgHost = _host+'/img';
    $rootScope.hasAd = false;
    $rootScope.adObj = null;
    $scope.topAd = null;
    $scope.miaoSha = [];
    var intervalId = {};
    var _miao_wait = false;

    var _get_data = function(callback) {
        DataListService.all(10, function(data) {
            $scope.orderDisabled = !data.canOrder;
            $scope.bookStr = data.bookStr;
            $scope.deliveryStr = data.deliveryStr;
            $scope.leftTime = data.leftTime;
            $scope.list = data.dataList;

            $scope.miaoSha = [];
            if (typeof data.miaosha !== 'undefined') {
                for (var i=0; i<data.miaosha.length; i++) {
                    var start = new Date(data.miaosha[i].startTime),
                        end = new Date(data.miaosha[i].endTime);

                    var obj = {
                        id: data.miaosha[i].id,
                        logo: data.miaosha[i].logo,
                        name: data.miaosha[i].name,
                        memo: data.miaosha[i].memo,
                        inventory: data.miaosha[i].inventory,
                        start: start.getHours()+':'+start.getMinutes()+':'+start.getSeconds(),
                        end: end.getHours()+':'+end.getMinutes()+':'+end.getSeconds(),
                        price: data.miaosha[i].price,
                        marketPrice: data.miaosha[i].marketPrice,
                        _start: data.miaosha[i].startTime,
                        _end: data.miaosha[i].endTime,
                        _current: data.miaosha[i].currentTime
                    };

                    if (data.miaosha[i].currentTime < data.miaosha[i].startTime) {
                        obj.lab = '开始';
                        obj.time = (start.getMonth()+1)+'月'+start.getDate()+'日 '+start.getHours()+':'+start.getMinutes()+':'+start.getSeconds()+' 开始';
                    } else {
                        obj.lab = '结束';
                        obj.time = (end.getMonth()+1)+'月'+end.getDate()+'日 '+end.getHours()+':'+end.getMinutes()+':'+end.getSeconds()+' 结束';
                    }

                    if (data.miaosha[i].endTime > data.miaosha[i].currentTime && data.miaosha[i].currentTime > data.miaosha[i].startTime) {
                        obj.status = true;
                        obj.needct = true;
                        _interval(moment.duration(data.miaosha[i].endTime - data.miaosha[i].currentTime), obj);
                    } else if (data.miaosha[i].endTime < data.miaosha[i].currentTime) {
                        obj.status = false;
                        obj.needct = false;
                        obj.msg = '活动已结束';
                    } else if (data.miaosha[i].startTime > data.miaosha[i].currentTime) {
                        obj.status = false;
                        obj.needct = true;
                        _miao_wait = true;
                        _interval(moment.duration(data.miaosha[i].startTime - data.miaosha[i].currentTime), obj);
                    }

                    $scope.miaoSha.push(obj);
                };
            }

            if (typeof callback === 'function') {
                callback.call();
            }
        });
        
        CartService.getCartCount(function(data) {
            $rootScope.badgeCount = data;
        });

        DataListService.getAd(function(data) {
            if (typeof data.fill !== 'undefined') {
                var fillAd = $localstorage.get('fillAd_'+data.fill.id);
                if (!fillAd || (fillAd != moment().date())) {
                    $rootScope.hasAd = true;
                    $rootScope.adObj = data.fill;

                    $localstorage.set('fillAd_'+data.fill.id, moment().date());
                }
            }

            if (typeof data.top !== 'undefined' && data.top.length) {
                $scope.topAd = data.top;
                $ionicSlideBoxDelegate.update();
            }
        });
    };

    var _interval = function(duration, obj) {
        var d = duration;
        intervalId[obj.id] = $interval(function() {
            d = moment.duration(d - 1000);

            if (!d.hours() && !d.minutes() && !d.seconds()) {
                $interval.cancel(intervalId[obj.id]);
                if (_miao_wait) {
                    obj.lab = '结束';
                    _miao_wait = false;
                    obj.status = true;
                    _interval(moment.duration(obj._end - Date.now()), obj);
                } else {
                    obj.duration = '00:00:00';
                    obj.status = false;
                    obj.needct = false;
                    obj.msg = '活动已结束';
                }
            } else {
                var txt = d.hours() + ':' + d.minutes() + ':' + d.seconds();
                obj.duration = txt;
                obj.needct = true;
            }
        }, 1000);
    };

    var _alert_upgrade = function(data, platform) {
        $ionicPopup.show({
            title: '居家宝应用当前有新版本',
            template: data.content,
            scope: $scope,
            buttons: [
                {
                    text: '关闭',
                    type: 'button-small'
                },
                {
                    text: '下载',
                    type: 'button-small button-positive',
                    onTap: function(e) {
                        if (platform === 'iOS') {
                            window.open('https://itunes.apple.com/us/app/ju-jia-bao/id961332219?l=zh&ls=1&mt=8');
                        } else if (platform === 'Android') {
                            navigator.app.loadUrl(encodeURI(data.url), {openExternal: true});
                        }
                    }
                }
            ]
        });
    };

    var _version_detect = function(args, _platform) {
        VersionService.version(args, function(data) {
            if (data.upgrade && data.must) {
                _alert_upgrade(data, _platform);
            } else if (data.upgrade && !data.must) {
                var info = $localstorage.get('upgrade_info');

                if (!info || ((Math.floor(Date.now() / 1000)) - info.time) > 60*60*24*3 || info.version != data.new_version) {
                    _alert_upgrade(data, _platform);
                    $localstorage.set('upgrade_info', JSON.stringify({version: data.new_version, time: Math.floor(Date.now() / 1000)}));
                }
            }
        });
    };

    $scope.slideHasChanged = function(index) {
        if (index === $scope.topAd.length) {
            $timeout(function() {
                $ionicSlideBoxDelegate.slide(0);
            }, 5000);
        }
    };

    document.addEventListener('deviceready', function() {
        var _platform = $cordovaDevice.getPlatform();
        var args = '?version='+_version+'&platform='+_platform;

        _version_detect(args, _platform);

        document.addEventListener('resume', function() {
            _version_detect(args, _platform);
        }, false);
    }, false);

    _get_data();

    $scope.addCart = function(itemId) {
        CartService.addCart(itemId, function() {
            $ionicPopup.alert({
                title: '成功',
                template: '该套餐成功加入购物车',
                okText: '确定'
            });

            $rootScope.badgeCount += 1;
        });
    };

    $scope.doRefresh = function() {
        _get_data(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $rootScope.closeAd = function() {
        $rootScope.hasAd = false;
    };

    var args = '';
    document.addEventListener('deviceready', function() {
        args += '&cordova=' + $cordovaDevice.getCordova();
        args += '&model=' + $cordovaDevice.getModel();
        args += '&platform=' + $cordovaDevice.getPlatform();
        args += '&uuid=' + $cordovaDevice.getUUID();
        args += '&version=' + $cordovaDevice.getVersion();
    }, false);

    $scope.miaoshaData = {};
    $scope.required = false;
    var md = '';
    var answerError = 0;
    var answerTitle = '请回答问题';
    $scope.activityAction = function(data) {
        var params = '?id='+data+args;

        if ($scope.miaoshaData.answer) {
            params += '&md='+md+'&answer='+$scope.miaoshaData.answer;
        }
        DataListService.seckillApi(params, function(res) {
            if (res.success && res.code === 100) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '秒杀成功'
                });
                $state.go('cart-order', {data: JSON.stringify(res.data)});
            } else if (res.success && (res.code === 200 || res.code === 300)) {
                md = res.data.md;
                if (answerError) {
                    answerTitle = '回答错误'
                }
                $ionicPopup.show({
                    template: '<div><p style="color:#333;font-size:15px;">'+res.data.questionPhone+'</p></div><div><input style="border:1px solid #ddd;" type="text" name="answer" ng-class="{required: required}" ng-model="miaoshaData.answer"></div>',
                    title: answerTitle,
                    scope: $scope,
                    buttons: [
                        {
                            text: '取消',
                            onTap: function() {
                                $scope.required = false;
                                $scope.miaoshaData.answer = '';
                                md = '';
                                answerError = 0;
                                answerTitle = '请回答问题';
                            }
                        },
                        {
                            text: '<b>确认</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.miaoshaData.answer) {
                                    e.preventDefault();
                                    $scope.required = true;
                                } else {
                                    $scope.activityAction(data);
                                    $scope.required = false;
                                    $scope.miaoshaData.answer = '';
                                }
                            }
                        }
                    ]
                });
                answerError = 1;
            }
        });
    };
})

.controller('TomorrowCtrl', function($scope, $ionicPopup, $rootScope, DataListService, CartService) {
    $scope.title = '明日预告';

    $scope.imgHost = _host+'/img';

    var _get_data = function(callback) {
        DataListService.all(20, function(data) {
            $scope.orderDisabled = !data.canOrder;
            $scope.bookStr = data.bookStr;
            $scope.deliveryStr = data.deliveryStr;
            $scope.leftTime = data.leftTime;
            $scope.list = data.dataList;

            if (typeof callback === 'function') {
                callback.call();
            }
        });
        CartService.getCartCount(function(data) {
            $rootScope.badgeCount = data;
        });
    };

    _get_data();

    $scope.hideBarButton = true;

    $scope.doRefresh = function() {
        _get_data(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('AdDetailCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaDevice, $ionicPopup, $ionicHistory, CartService, VersionService, AdService) {
    $scope.title = '';
    $scope.imgHost = _host+'/img';
    $rootScope.hasAd = false;
    $scope.content = null;
    $scope.button = null;
    $scope.needUpgrade = false;
    $scope.unsupportMsg = '';

    var _get_data = function() {
        AdService.detail($stateParams.adId, function(data) {
            $scope.title = data.name;
            $scope.content = JSON.parse(data.content);
            if (data.actions) {
                $scope.button = JSON.parse(data.actions);
            }

            if (parseInt(_version) < data.supportVersion) {
                $scope.needUpgrade = true;
                $scope.unsupportMsg = data.unsupportMsg;
            }
        });
    };

    var _alert_upgrade = function(data, platform) {
        $ionicPopup.show({
            title: '居家宝应用当前有新版本',
            template: data.content,
            scope: $scope,
            buttons: [
                {
                    text: '关闭',
                    type: 'button-small'
                },
                {
                    text: '下载',
                    type: 'button-small button-positive',
                    onTap: function(e) {
                        if (platform === 'iOS') {
                            window.open('https://itunes.apple.com/us/app/ju-jia-bao/id961332219?l=zh&ls=1&mt=8');
                        } else if (platform === 'Android') {
                            navigator.app.loadUrl(encodeURI(data.url), {openExternal: true});
                        }
                    }
                }
            ]
        });
    };

    var _version_detect = function(args, _platform) {
        VersionService.version(args, function(data) {
            if (data.upgrade && data.must) {
                _alert_upgrade(data, _platform);
            } else if (data.upgrade && !data.must) {
                var info = $localstorage.get('upgrade_info');

                if (((Math.floor(Date.now() / 1000)) - info.time) > 60*60*24*3 || info.version != data.new_version) {
                    _alert_upgrade(data, _platform);
                    $localstorage.set('upgrade_info', JSON.stringify({version: data.new_version, time: Math.floor(Date.now() / 1000)}));
                }
            }
        });
    };

    _get_data();

    $scope.adAction = function() {
        switch($scope.button.function) {
            case 'doOrder':
                doOrder();
                break;
            case 'doUpgrade':
                doUpgrade();
                break;
            case 'goBack':
                goBack();
                break;
        }
    };

    var doOrder = function() {
        CartService.addCart($scope.button.args[0], function() {
            $ionicPopup.alert({
                title: '成功',
                template: '该套餐成功加入购物车',
                okText: '确定'
            });

            $rootScope.badgeCount += 1;
        });
    };

    var doUpgrade = function() {
        var _platform = '';
        var args = '';
        document.addEventListener('deviceready', function() {
            _platform = $cordovaDevice.getPlatform();
            args = '?version='+_version+'&platform='+_platform;
        }, false);

        _version_detect(args, _platform);
    };

    var goBack = function() {
        $ionicHistory.goBack();
    };

    $scope.upGrade = function() {
        doUpgrade();
    };
})

.controller('ItemDetailCtrl', function($scope, $state, $stateParams, $rootScope, $ionicPopup, $ionicSlideBoxDelegate, DataListService, CartService) {
    $scope.imgHost = _host+'/img';
    var style = ['red', 'blue', 'green'];

    DataListService.get($stateParams.weekId, function(data) {
        $scope.canOrder = data.canOrder;
        $scope.leftTime = data.leftTime;
        $scope.item = data.data;

        for (var i = $scope.item.foodDetailList.length - 1; i >= 0; i--) {
            $scope.item.foodDetailList[i].style = style[i];
        };

        $ionicSlideBoxDelegate.update();
    });

    $scope.addCart = function(itemId) {
        CartService.addCart(itemId, function() {
            $ionicPopup.alert({
                title: '成功',
                template: '该套餐成功加入购物车',
                okText: '确定'
            });

            $rootScope.badgeCount += 1;
            $state.go('tab.today');
        });
    };
})

.controller('ItemCommentCtrl', function($scope, $stateParams, CommentService) {
    $scope.title = '评论';
    $scope.imgHost = _host+'/logo';

    $scope.hasMore = false;
    $scope.commentList = [];

    var pageNo = 1;
    var _get_comment = function() {
        CommentService.get({id: $stateParams.itemId, page: pageNo}, function(data) {
            $scope.commentList = $scope.commentList.concat(data.dataList);
            $scope.hasMore = data.haveMore;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
            pageNo += 1;
        });
    };

    _get_comment();

    $scope.doRefresh = function() {
        pageNo = 1;
        $scope.commentList = [];
        _get_comment();
    };

    $scope.moreDataCanBeLoaded = function() {
        return $scope.hasMore;
    };

    $scope.loadMore = function() {
        _get_comment();
    };
})

.controller('CartCtrl', function($scope, $state, $rootScope, $ionicPopup, $cordovaDevice, $ionicModal, CartService, MemberService, OrderService) {
    $scope.title = '购物车';

    $scope.imgHost = _host+'/img';
    $scope.cartCount = 0;
    $scope.tempAddress;
    $scope.hasDiscount = false;
    $scope.discount = null;
    $scope.discountAmount = 0;
    $scope.afterDiscount = 0;
    $scope.townId = 0;

    CartService.all(function(data) {
        $scope.cartList = data;
        $scope.cartCount = data.datalist.length;
        $scope.selectedAddress = data.defaultAddress;
        $scope.tempAddress = data.defaultAddress;
        $rootScope.badgeCount = data.cnt;
        $scope.townId = data.defaultAddress.townId;

        if (typeof data.extend !== 'undefined' && data.extend) {
            $scope.hasDiscount = true;
            $scope.discount = data.extend.discount;
            $scope.discountAmount = 0;
            for (var i=$scope.discount.length - 1; i>=0; i--) {
                $scope.discountAmount += $scope.discount[i].discountAmount;
            };
        }

        $scope.afterDiscount = $scope.cartList.sum - $scope.discountAmount;
    });

    var args = '';
    document.addEventListener('deviceready', function() {
        args += '&cordova=' + $cordovaDevice.getCordova();
        args += '&model=' + $cordovaDevice.getModel();
        args += '&platform=' + $cordovaDevice.getPlatform();
        args += '&uuid=' + $cordovaDevice.getUUID();
        args += '&version=' + $cordovaDevice.getVersion();
    }, false);

    $scope.submitOrder = function() {
        if ($scope.selectedAddress) {
            var carts = '?address='+$scope.selectedAddress.id;
            for (var i = $scope.cartList.datalist.length - 1; i >= 0; i--) {
                carts += '&carts='+$scope.cartList.datalist[i].id;
            };

            if (args) {
                carts += args;
            }

            OrderService.submitOrder(carts, function(data) {
                if (data.success) {
                    $state.go('cart-order', {data: JSON.stringify(data.data)});
                }
            });
        } else {
            $ionicPopup.alert({
                title: '提交订单错误',
                template: '请选择一个送货地址',
                okText: '关闭'
            });
        }
    };

    $scope.addCount = function(item) {
        if (item.count < 500) {
            item.count += 1;
            $scope.cartList.cnt += 1;
            $scope.cartList.sum += item.foodSet.price;

            CartService.setCart(item, $scope.townId, function(data){
                $rootScope.badgeCount += 1;
                if (typeof data.extend !== 'undefined' && data.extend) {
                    $scope.hasDiscount = true;
                    $scope.discount = data.extend.discount;
                    $scope.discountAmount = 0;
                    for (var i=$scope.discount.length - 1; i>=0; i--) {
                        $scope.discountAmount += $scope.discount[i].discountAmount;
                    };
                }
                $scope.afterDiscount = $scope.cartList.sum - $scope.discountAmount;
            });
        }
    };

    $scope.minusCount = function(item) {
        if (item.count > 0) {
            item.count -= 1;
            $scope.cartList.cnt -= 1;
            $scope.cartList.sum -= item.foodSet.price;

            CartService.setCart(item, $scope.townId, function(data){
                $rootScope.badgeCount -= 1;
                if (typeof data.extend !== 'undefined' && data.extend) {
                    $scope.hasDiscount = true;
                    $scope.discount = data.extend.discount;
                    $scope.discountAmount = 0;
                    for (var i=$scope.discount.length - 1; i>=0; i--) {
                        $scope.discountAmount += $scope.discount[i].discountAmount;
                    };
                }
                $scope.afterDiscount = $scope.cartList.sum - $scope.discountAmount;
            });
        }
    };

    $ionicModal.fromTemplateUrl('templates/select-address.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.selectAddress = function(address) {
        $scope.selectedAddress = address;
        $scope.defaultAddressId = address.id;
        MemberService.getAllAddress(function(data) {
            $scope.addressList = data;
        });
        $scope.modal.show();
    };

    $scope.confirmAddress = function(address) {
        $scope.selectedAddress = address;
        $scope.townId = address.townId;

        CartService.getDiscountApi($scope.townId, function(data) {
            if (typeof data.discount !== 'undefined' && data.discount) {
                $scope.hasDiscount = true;
                $scope.discount = data.discount;
                $scope.discountAmount = 0;
                for (var i=$scope.discount.length - 1; i>=0; i--) {
                    $scope.discountAmount += $scope.discount[i].discountAmount;
                };
            }
            $scope.afterDiscount = $scope.cartList.sum - $scope.discountAmount;
            $scope.modal.hide();
        });
    };

    $scope.changeAddress = function(address) {
        $scope.tempAddress = address;
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.hasCart = function() {
        return $scope.cartCount;
    };
})

.controller('CartOrderCtrl', function($scope, $state, $ionicHistory, $stateParams, $localstorage, OrderService) {
    $scope.title = '订单确认';
    var data = JSON.parse($stateParams.data);

    $scope.imgHost = _host+'/img';
    $scope.orderNum = data.orderNo.toString();
    $scope.totalOrderCount = data.count;
    $scope.totalPrice = data.amount;
    $scope.cartList = data.detailList;

    $scope.contact = data.name;
    $scope.mobile = data.mobile;
    $scope.address = data.address;

    $scope.orderPay = function() {
        $state.go('cart-pay', {data: JSON.stringify({id: data.id, no: data.orderNo, params: data})});
    };

    $scope.backOrder = function() {
        $state.go('tab.today');
    };
})

.controller('CartPayCtrl', function($scope, $state, $ionicHistory, $ionicPopup, $stateParams, $localstorage, OrderService, BankService) {
    $scope.title = '支付确认';
    var params = JSON.parse($stateParams.data);

    $scope.data = {};
    $scope.pay = {};
    BankService.prepare(params.id, function(res) {
        $scope.data = res.data;
    });

    $scope.showPayNow = function() {
        var myPopup = $ionicPopup.show({
                        template: '<input type="password" ng-model="pay.password">',
                        title: '本次应支付 '+$scope.data.toPay+'元',
                        subTitle: '输入支付密码',
                        scope: $scope,
                        buttons: [
                            {
                                text: '<b>立即支付</b>',
                                type: 'button-assertive',
                                onTap: function(e) {
                                    if (!$scope.pay.password) {
                                        e.preventDefault();
                                    } else {
                                        BankService.pay({id: params.id, payPass: $scope.pay.password, walletMoney: $scope.data.walletMoney}, function(res) {
                                            if (res.success) {
                                                if (res.data.toPay) {
                                                    $scope.orderPay();
                                                } else {
                                                    $state.go('cart-order-success', {data: JSON.stringify(params.params)});
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            {text: '取消'}
                        ]
                    });
    };

    $scope.goToBank = function() {
        $state.go('tab.setting', {referer: 'tab.bank-center'});
    };

    var ref,
        breakUrl = _host + '/order/phone/nofilter/paybreak',
        returnUrl = _host + '/order/phone/nofilter/payreturn';

    var iabLoadStart = function(event) {
        if (event.url.startsWith(breakUrl) || event.url.startsWith(returnUrl)) {
            ref.close();
        }

        if (event.url.startsWith(returnUrl)) {
            OrderService.resetCookie($localstorage.get('cookie'), function() {
                $state.go('cart-order-success', {data: JSON.stringify(params.params)});
            });
        } else if (event.url.startsWith(breakUrl)) {
            OrderService.resetCookie($localstorage.get('cookie'), function() {
                $state.go('tab.today');
            });
        }
    };
    var iabLoadStop = function(event) {
        // if (event.url.match(breakUrl) || event.url.match(returnUrl)) {
        //     ref.close();
        // }

        // OrderService.resetCookie($localstorage.get('cookie'), function() {
        //     if (event.url.match(returnUrl)) {
        //         $state.go('cart-order-success', {data: $stateParams.data});
        //     } else if (event.url.match(breakUrl)) {
        //         $state.go('tab.today');
        //     }
        // });
    };
    var iabExit = function(event) {
    	OrderService.resetCookie($localstorage.get('cookie'), function() {});
        ref.removeEventListener('loadstart', iabLoadStart);
        ref.removeEventListener('loadstop', iabLoadStop);
        ref.removeEventListener('exit', iabExit);
        ref = null;
    };
    $scope.orderPay = function() {
        if (ref) {
            ref.show();
        } else {
            var url = OrderService.getPayUrl(params.no);
            var options = 'location=no,closebuttoncaption=完成,clearcache=yes,clearsessioncache=yes';
            OrderService.open4Pay(function(data) {
                $localstorage.set('cookie', data);
                ref = window.open(url, '_blank', options);

                ref.addEventListener('loadstart', iabLoadStart);
                ref.addEventListener('loadstop', iabLoadStop);
                ref.addEventListener('exit', iabExit);
            });
        }
    };

    $scope.backOrder = function() {
        $state.go('tab.today');
    };
})

.controller('CartOrderSuccessCtrl', function($scope, $state, $stateParams) {
    $scope.title = '订餐成功';

    var data = JSON.parse($stateParams.data);

    $scope.imgHost = _host+'/img';
    $scope.orderNum = data.orderNo.toString();
    $scope.totalOrderCount = data.count;
    $scope.totalPrice = data.amount;
    $scope.cartList = data.detailList;
    $scope.tip = data.orderTip;

    $scope.contact = data.name;
    $scope.mobile = data.mobile;
    $scope.address = data.address;

    $scope.backOrder = function() {
        $state.go('tab.today');
    }
})

.controller('SettingCtrl', function($scope, $stateParams, $ionicHistory, $state, $ionicPopup, MemberService) {
    $scope.title = '设置';
    $scope.versionName = _versionName;

    if ($stateParams.referer) {
        $stateParams.referer = null;
        $state.go('tab.bank-center');
    }

    $scope.isLogin = false;
    MemberService.checkLogin(function(data) {
        if (data.success && data.islogin) {
            $scope.isLogin = true;
        }
    });

    $scope.logout = function() {
        MemberService.logout(function() {
            $ionicPopup.alert({
                title: '注销成功',
                template: '当前用户成功注销'
            });
            $state.go('login');
        });
    };
})

.controller('OrderCtrl', function($scope, $state, $stateParams, OrderService) {
    $scope.title = '订单管理';

    $scope.unpaidCount = 0;
    $scope.imgHost = _host+'/img';
    $scope.tabIndex = 1;
    $scope.hasMore = false;
    $scope.orderList = [];
    $scope.hasData = false;

    var pageNo = 1;
    var _getOrderList = function(params, callback) {
        OrderService.all(params, function(data) {
            if (data.unpaidCount) {
                $scope.unpaidCount = data.unpaidCount;
            }
            $scope.hasData = data.orderList.length ? true: false;
            $scope.orderList = $scope.orderList.concat(data.orderList);
            $scope.hasMore = data.haveMore;
            $scope.$broadcast('scroll.infiniteScrollComplete');

            if (typeof callback === 'function') {
                callback.call();
            }
        });
    };
    _getOrderList({status: $stateParams.status, pageNo: pageNo});

    $scope.moreDataCanBeLoaded = function() {
        return $scope.hasMore;
    };

    $scope.loadMore = function(tabIndex) {
        var status = 10;
        if (tabIndex === 1) {
            status = 10;
        } else if (tabIndex === 2) {
            status = 70;
        } else if (tabIndex === 3) {
            status = 50;
        }

        pageNo += 1;
        _getOrderList({status: status, pageNo: pageNo});
    };

    $scope.submitOrder = function(order) {
        OrderService.payOrder(order.id, function(data) {
            $state.go('cart-order', {data: JSON.stringify(data)});
        });
    };

    $scope.cancelOrder = function(order) {
        OrderService.cancelOrder(order.id, function(data) {
            if (data.success) {
                for (var i = $scope.orderList.length - 1; i >= 0; i--) {
                    if ($scope.orderList[i].id === order.id) {
                        $scope.orderList.splice(i, 1);
                        $scope.unpaidCount -= 1;
                    }
                };
            }
        });
    };

    $scope.getOrderList = function(status) {
        if (status === 10) {
            $scope.tabIndex = 1;
        } else if (status === 70) {
            $scope.tabIndex = 2;
        } else {
            $scope.tabIndex = 3;
        }

        pageNo = 1;
        $scope.orderList = [];
        _getOrderList({status: status, pageNo: pageNo});
    };

    $scope.orderComment = function(order) {
        $state.go('tab.setting-order-comment', {data: JSON.stringify(order.detailList)});
    };

    $scope.doRefresh = function(tabIndex) {
        var status = 10;
        if (tabIndex === 1) {
            status = 10;
        } else if (tabIndex === 2) {
            status = 70;
        } else if (tabIndex === 3) {
            status = 50;
        }

        pageNo = 1;
        $scope.orderList = [];
        _getOrderList({status: status, pageNo: pageNo}, function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('OrderCommentCtrl', function($scope, $ionicPopup, $stateParams, $ionicHistory, CommentService) {
    $scope.title = '订单评论';

    $scope.imgHost = _host+'/img';
    $scope.dataList = JSON.parse($stateParams.data);

    $scope.orderComment = function() {
        var data = '?';

        for (var i = $scope.dataList.length - 1; i >= 0; i--) {
            if ($scope.dataList[i] && $scope.dataList[i].comment) {
                data += 'orderDetail=' + $scope.dataList[i].id;
                data += '&comment=' + $scope.dataList[i].comment;
                data += '&';
            }
        };

        if (data.length > 1) {
            CommentService.submit(data, function(data) {
                if (data.success) {
                    $ionicPopup.alert({
                        title: '成功',
                        template: '评论已经提交成功',
                        okText: '确定'
                    });

                    $ionicHistory.goBack();
                }
            });
        }
    }
})

.controller('AddressCtrl', function($scope, $ionicListDelegate, MemberService) {
    $scope.title = '收货地址管理';

    MemberService.getAllAddress(function(data) {
        $scope.addressList = data;
    });

    $scope.defaultAddress = function(address) {
        MemberService.setDefaultAddress(address.id, function(data) {
            if (data.success) {
                for (var i = $scope.addressList.length - 1; i >= 0; i--) {
                    if ($scope.addressList[i].id === address.id) {
                        $scope.addressList[i].status = 20;
                    } else {
                        $scope.addressList[i].status = 10;
                    }
                };
                $ionicListDelegate.closeOptionButtons();
            }
        });
    };

    $scope.deleteAddress = function(address) {
        MemberService.deleteAddress(address.id, function(data) {
            if (data.success) {
                for (var i = $scope.addressList.length - 1; i >= 0; i--) {
                    if ($scope.addressList[i].id === address.id) {
                        $scope.addressList.splice(i, 1);
                    }
                };
            }
        });
    };
})

.controller('NewAddressCtrl', function($scope, $state, $ionicHistory, $ionicModal, $ionicPopup, MemberService) {
    $scope.title = '新建收货地址';

    $ionicModal.fromTemplateUrl('templates/address-section.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.$on('modal.hidden', function() {
        $scope.hasRegion = true;
    });

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.levelOneRegion = {id: 0, name: '选择地区'};
    $scope.levelTwoRegion = null;
    $scope.levelThreeRegion = null;
    $scope.levelFourRegion = null;
    $scope.levelFiveRegion = null;
    $scope.currentLevel = 1;
    $scope.address = {};
    $scope.addressValid = false;

    $scope.selectRegion = function(region) {
        $scope.addressValid = false;
        switch($scope.currentLevel) {
            case 1:
                $scope.levelOneRegion = region;
                break;
            case 2:
                $scope.levelTwoRegion = region;
                break;
            case 3:
                $scope.levelThreeRegion = region;
                break;
            case 4:
                $scope.levelFourRegion = region;
                break;
            case 5:
                $scope.levelFiveRegion = region;
                break;
            default:
                break;
        }

        if (region && !parseInt(region.hasChild)) {
            if ($scope.currentLevel == 2) {
                $scope.levelThreeRegion = null;
            } else if ($scope.currentLevel == 3) {
                $scope.levelFourRegion = null;
            } else if ($scope.currentLevel == 4) {
                $scope.levelFiveRegion = null;
            }
            $scope.addressValid = true;
            $scope.modal.hide();
            return false;
        }
        $scope.currentLevel += 1;
        MemberService.createAddress(region, function(data) {
            switch($scope.currentLevel) {
                case 1:
                    $scope.regionTitle = '选择地区';
                    break;
                case 2:
                    $scope.regionTitle = '选择商圈';
                    break;
                case 3:
                    $scope.regionTitle = '选择大楼';
                    break;
                case 4:
                    $scope.regionTitle = '选择楼区';
                    break;
                case 5:
                    $scope.regionTitle = '选择单元';
                    break;
                default:
                    $scope.regionTitle = '选择地区';
                    break;
            }

            $scope.section = data;
            $scope.modal.show();
        });
    };

    $scope.getAddressSection = function(level, region) {
        switch(level) {
            case 1:
                $scope.regionTitle = '选择地区';
                break;
            case 2:
                $scope.regionTitle = '选择商圈';
                break;
            case 3:
                $scope.regionTitle = '选择大楼';
                break;
            case 4:
                $scope.regionTitle = '选择楼区';
                break;
            case 5:
                $scope.regionTitle = '选择单元';
                break;
            default:
                $scope.regionTitle = '选择地区';
                break;
        }
        $scope.currentLevel = level;

        MemberService.createAddress(region, function(data) {
            $scope.section = data;
            $scope.modal.show();
        });
    };

    $scope.saveAddress = function() {
        if (!$scope.address || !$scope.address.manualAddress || !$scope.address.floor ||
            !$scope.address.contact || !$scope.address.mobile || !$scope.addressValid) {
            $ionicPopup.alert({
                title: '保存地址错误',
                template: '您的地址选择不正确，并且需要填入联系人，电话，楼层和详细地址',
                okText: '关闭'
            });
        } else if ($scope.address.mobile.length > 11) {
            $ionicPopup.alert({
                title: '手机错误',
                template: '您的的手机号码长度不正确',
                okText: '关闭'
            });
        } else {
            var region = [];
            if ($scope.levelOneRegion.id) {
                region.push({
                    id: $scope.levelOneRegion.id,
                    name: $scope.levelOneRegion.name,
                    type: $scope.levelOneRegion.type
                });
            }
            if ($scope.levelTwoRegion) {
                region.push({
                    id: $scope.levelTwoRegion.id,
                    name: $scope.levelTwoRegion.name,
                    type: $scope.levelTwoRegion.type
                });
            }
            if ($scope.levelThreeRegion) {
                region.push({
                    id: $scope.levelThreeRegion.id,
                    name: $scope.levelThreeRegion.name,
                    type: $scope.levelThreeRegion.type
                });
            }
            if ($scope.levelFourRegion) {
                region.push({
                    id: $scope.levelFourRegion.id,
                    name: $scope.levelFourRegion.name,
                    type: $scope.levelFourRegion.type
                });
            }
            if ($scope.levelFiveRegion) {
                region.push({
                    id: $scope.levelFiveRegion.id,
                    name: $scope.levelFiveRegion.name,
                    type: $scope.levelFiveRegion.type
                });
            }

            MemberService.saveAddress({region: JSON.stringify(region), address: $scope.address}, function(data) {
                if (data.success) {
                    $ionicHistory.goBack();
                }
            });
        }
    };
})

.controller('AboutCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, MemberService, CameraService, AboutService) {
    $scope.title = '关于我们';

    AboutService.about(function(data) {
    	if(!data) {
    		return;
    	}

    	var lst = eval(data);
    	$scope.budinglist = lst;
    });
})

.controller('AccountCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, MemberService, CameraService) {
    $scope.title = '个人中心';

    MemberService.info(function(data) {
        $scope.member = data.data;
        $scope.member.logo = _host+'/logo'+data.data.logo;
    });

    $scope.getPhoto = function() {
        CameraService.getPicture({
            quality: 60,
            allowEdit: true,
            sourceType: 0,
            targetWidth: 128,
            targetHeight: 128,
            saveToPhotoAlbum: true,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        }).then(function(imageURI) {
            $ionicLoading.show();
            MemberService.uploadAvatar($localstorage.get('token'), imageURI, function(r) {
                $ionicLoading.hide();
                $scope.member.logo = imageURI;
            }, function(error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: '错误',
                    template: '保存头像出错，请稍后重试',
                    okText: '关闭'
                });
            });
        }, function(err) {
            console.err(err);
        });
    };
})

.controller('AccountNicknameCtrl', function($scope, $ionicPopup, $ionicHistory, MemberService) {
    $scope.title = '修改昵称';
    $scope.nickname;

    $scope.updateNickname = function(nickname) {
        if (!nickname) {
            $ionicPopup.alert({
                title: '错误',
                template: '请输入新的昵称',
                okText: '关闭'
            });
        } else {
            MemberService.updateNickname(nickname, function(data) {
                if (data.success) {
                    $ionicPopup.alert({
                        title: '成功',
                        template: '昵称修改成功',
                        okText: '确定'
                    });
                    $ionicHistory.goBack();
                }
            });
        }
    };
})

.controller('AccountPasswordCtrl', function($scope, $ionicPopup, $ionicHistory, MemberService) {
    $scope.title = '修改密码';
    $scope.password;

    $scope.updatePassword = function(password) {
        if (!password || !password.old || !password.new1 || !password.new2) {
            $ionicPopup.alert({
                title: '错误',
                template: '请输入原密码和新密码',
                okText: '关闭'
            });
        } else if (password.new1 !== password.new2) {
            $ionicPopup.alert({
                title: '错误',
                template: '输入的新密码不一致',
                okText: '关闭'
            });
        } else {
            MemberService.updatePassword(password, function(data) {
                if (data.success) {
                    $ionicPopup.alert({
                        title: '成功',
                        template: '密码修改成功',
                        okText: '确定'
                    });
                    $ionicHistory.goBack();
                }
            });
        }
    };
})

.controller('BankIndexCtrl', function($scope, $state, $ionicPopup, $rootScope, $ionicLoading, $localstorage, $ionicHistory, BankService, OrderService) {
    $scope.title = '充值中心';
    $scope.needSetPd = false;
    $scope.hasAccount = false;
    $scope.password = {};

    var bv = $ionicHistory.viewHistory();
    if (bv.backView) {
        bv.backView.stateParams = null;
    }

    BankService.exists(function(data) {
        if (!data.data) {
            $scope.needSetPd = true;
        } else {
            BankService.getInfo(function(data) {
                $scope.account = data;
                $scope.hasAccount = true;
            });
        }
    });

    $scope.setPassword = function() {
        if ($scope.password.pd1 && $scope.password.pd1.length >= 6) {
            if ($scope.password.pd1 != $scope.password.pd2) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '两次密码设置不一致',
                    okText: '确定'
                });
            } else {
                BankService.setpd($scope.password.pd1, function(data) {
                    if (data.success) {
                        $scope.hasAccount = true;
                        $scope.needSetPd = false;
                        BankService.getInfo(function(data) {
                            $scope.account = data;
                            $scope.hasAccount = true;
                            $scope.needSetPd = false;
                        });
                    }
                });
            }
        } else {
            $ionicPopup.alert({
                title: '提示',
                template: '密码不符合要求',
                okText: '确定'
            });
        }
    };

    $scope.doRecharge = function(id) {
        var payResultId,
            ref,
            breakUrl = _host +'/order/phone/nofilter/recharge-paybreak',
            returnUrl = _host + '/order/phone/nofilter/recharge-payreturn';

        var iabLoadStart = function(event) {
            console.log("loadstart=");
            if (event.url.startsWith(breakUrl) || event.url.startsWith(returnUrl)) {
                ref.close();
            }

            if (event.url.startsWith(returnUrl)) {
                OrderService.resetCookie($localstorage.get('cookie'), function() {
                    $state.go('bank-success', {data: payResultId});
                });
            } else if (event.url.startsWith(breakUrl)) {
                OrderService.resetCookie($localstorage.get('cookie'), function() {});
            }
        };
        var iabLoadStop = function(event) {
            // alert(event.url);
            // if (event.url.match(breakUrl) || event.url.match(returnUrl)) {
            //     ref.close();
            // }

            // if (event.url.match(breakUrl)) {
            //     alert(data.data.id);
            //     OrderService.resetCookie($localstorage.get('cookie'), function() {
            //         $state.go('bank-success', {data: data.data.id});
            //     });
            // }
        };
        var iabExit = function(event) {
            console.log("exit");
        	OrderService.resetCookie($localstorage.get('cookie'), function() {});
            ref.removeEventListener('loadstart', iabLoadStart);
            ref.removeEventListener('loadstop', iabLoadStop);
            ref.removeEventListener('exit', iabExit);
            ref = null;
        };

        BankService.doRecharge(id, function(data) {
            if (data.success) {
                if (ref) {
                    ref.show();
                } else {
                    payResultId = data.data.id;
                    var url = BankService.payRecharge(payResultId);
                    var options = 'location=no,closebuttoncaption=完成,clearcache=yes,clearsessioncache=yes';
                    console.log("payRecharge="+url);
                    OrderService.open4Pay(function(data) {
                        $localstorage.set('cookie', data);
                        url += "&token=" + $localstorage.get("token");

                        ref = window.open(url, '_blank', options);

                        ref.addEventListener('loadstart', iabLoadStart);
                        ref.addEventListener('loadstop', iabLoadStop);
                        ref.addEventListener('exit', iabExit);
                    });
                };
            }
        });
    };
})

.controller('BankSuccessCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicLoading, $localstorage, BankService) {
    $scope.title = '充值结果';

    $scope.result = {};
    BankService.payResult($stateParams.data, function(data) {
        $scope.result = data;
    });

    $scope.backBank = function() {
        $state.go('tab.bank-center');
    };
})

.controller('BankManageCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, BankService) {
    $scope.title = '充值管理';
})

.controller('BankBillingCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, BankService) {
    $scope.title = '电子账单';

    var pageNo = 1;
    $scope.list = [];
    $scope.hasMore = false;

    var _load_billinglist = function(page, callback) {
        BankService.billingList(page, function(data) {
            $scope.list = $scope.list.concat(data.dataList);
            $scope.hasMore = data.haveMore;

            if (callback) {
                callback.call();
            }
        });
    };

    _load_billinglist(pageNo);
    $scope.loadMore = function() {
        pageNo += 1;
        _load_billinglist(pageNo);
    };

    $scope.doRefresh = function() {
        pageNo = 1;
        $scope.list = [];
        _load_billinglist(pageNo, function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('BankResetpdCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, BankService) {
    $scope.title = '修改密码';

    $scope.password = {};

    $scope.setPassword = function() {
        if ($scope.password.newpd1 && $scope.password.newpd1.length >= 6) {
            if ($scope.password.newpd1 != $scope.password.newpd2) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '两次密码设置不一致',
                    okText: '确定'
                });
            } else {
                BankService.resetPd({oldPwd: $scope.password.oldpd, newPwd: $scope.password.newpd1}, function(data) {
                    if (data.success) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '密码修改成功',
                            okText: '确定'
                        });
                    }
                });
            }
        } else {
            $ionicPopup.alert({
                title: '提示',
                template: '密码不符合要求',
                okText: '确定'
            });
        }
    };
})

.controller('BankFindpdCtrl', function($scope, $ionicPopup, $ionicLoading, $localstorage, BankService) {
    $scope.title = '找回密码';

    $scope.password = {};
    $scope.title = '找回密码';

    $scope.data = {};
    $scope.sendMsg = function() {
        BankService.sendFindPassMsg($scope.data.userName, function(res) {
            if (res.success) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '短信已发送成功，请注意查收',
                    okText: '关闭'
                });
            }
        });
    };

    $scope.findPassword = function() {
        if ($scope.data.newPass && $scope.data.newPass.length >= 6) {
            BankService.findPass($scope.data, function(res) {
                if (res.success) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '密码重置成功',
                        okText: '关闭'
                    });
                }
            });
        } else {
            $ionicPopup.alert({
                title: '提示',
                template: '密码不符合要求',
                okText: '确定'
            });
        }
    };
})
;


