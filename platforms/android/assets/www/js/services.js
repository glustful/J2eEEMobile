var _getVersionApi = '/version/phone',
    _smsApi = '/register/sendSMS',
    _signupApi = '/register/phone/do',
    _agreementApi = '/register/phone/legalprovisions',
    _loginApi = '/login/phone',
    _logoutApi = '/login/phone/logoff',
    _findPassMsgApi = '/register/phone/findpassmsg',
    _findPassword = '/register/phone/findPassword',
    _listApi = '/food/phone',
    _adApi = '/advertisement/phone',
    _seckillApi = '/seckill/phone',
    _adDetailApi = '/advertisement/phone/detail',
    _itemDetailApi = '/food/phone/detail',
    _itemCommentApi = '/food/phone/comment-list',
    _submitCommentApi = '/order/phone/comment',
    _getCartApi = '/cart/phone/getcart',
    _addCartApi = '/cart/phone/addcart',
    _setCartApi = '/cart/phone/setcart',
    _getDiscountApi = '/cart/phone/getdiscount',
    _getCartCountApi = '/cart/phone/cartcount',
    _submitOrderApi = '/order/phone/submitorder',
    _payOrderApi = '/pay/phone',
    _getOrderListApi = '/order/phone/orderlist',
    _cancelOrderApi = '/order/phone/cancel',
    _getOrderInfo = '/order/phone/showorder',
    _createAddressApi = '/address/phone/region',
    _saveAddressApi = '/address/phone/save',
    _getAddressApi = '/address/phone/list',
    _deleteAddressApi = '/address/phone/remove',
    _setDefaultAddressApi = '/address/phone/setdefault',
    _updatePasswordApi = '/user/phone/resetpwd',
    _updateNicknameApi = '/user/phone/update',
    _getMemberInfoApi = '/user/phone/getuser',
    _getCookie = '/order/phone/getcookie',
    _setCookie = '/order/phone/nofilter/resetcookie',
    _uploadAvatarApi = '/user/phone/head',
    _checkLoginApi = '/login/phone/islogin',
    _rechargeExistsApi = '/recharge/phone/exists',
    _rechargeSetPdApi = '/recharge/phone/setpass',
    _rechargePageApi = '/recharge/phone/page',
    _rechargeDetailApi = '/recharge/phone/detaillist',
    _rechargeDoApi = '/recharge/phone/do',
    _rechargeResetPdApi = '/recharge/phone/resetpwd',
    _rechargeGiftPayApi = '/pay/phone/recharge',
    _rechargeGiftPayResultApi = '/recharge/phone/finish',
    _rechargePrepareApi = '/recharge/phone/prepare',
    _rechargePayApi = '/recharge/phone/pay',
    _rechargeFdpassMsgApi = '/recharge/phone/findpaypassmsg',
    _rechargeFdpassApi = '/recharge/phone/findpayPassword',
    _budingApi = '/site/phone/buding';


angular.module('jujiabao.services', ['ngCordova'])

.factory('LoginService', function($http, $ionicLoading) {
    var loginUrl = _host + _loginApi;

    return {
        doLogin: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: loginUrl+'?user='+data.user+'&pass='+data.pass,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('SignupService', function($http, $ionicLoading) {
    var smsUrl = _host + _smsApi,
        signupUrl = _host + _signupApi,
        agreementApi = _host + _agreementApi;

    return {
        getSms: function(data,successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: smsUrl+'?userName='+data.mobile,
                withCredentials: true
            }).success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        doSignup: function(data, successCB) {
            $ionicLoading.show();

            $http({
                method: 'POST',
                url: signupUrl+'?userName='+data.mobile+'&password='+data.password+'&verifyCode='+data.code+'&nickname='+data.nickname+'&regionJson='+data.region+'&name='+data.address.contact+'&mobile='+data.address.mobile+'&floor='+data.address.floor+'&manualAddress='+data.address.manualAddress,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getAgreement: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: agreementApi,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('ForgetService', function($http, $ionicLoading) {
    var smsUrl = _host + _findPassMsgApi,
        resetUrl = _host + _findPassword;

    return {
        getSms: function(data,successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: smsUrl+'?userName='+data.mobile,
                withCredentials: true
            }).success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        reset: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: resetUrl+'?userName='+data.mobile+'&newPass='+data.password+'&verifyCode='+data.code,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('VersionService', function($http, $ionicLoading) {
    var versionApi = _host + _getVersionApi;

    return {
        version: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: versionApi+data,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('DataListService', function($http, $ionicLoading) {
    var listApi = _host + _listApi,
        itemDetailApi = _host + _itemDetailApi,
        adApi = _host + _adApi,
        seckillApi = _host + _seckillApi;

    return {
        all: function(time, successCB) {
            $ionicLoading.show();
            
            $http({
                method: 'GET',
                url: listApi+'?time='+time,
                withCredentials: true
            })

            .success(function(data, status, headers, config, statusText) {
                
                
                successCB.call(this, data);
            })
            
            ;
        },
        get: function(weekId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: itemDetailApi+'?weekId='+weekId,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getAd: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: adApi,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        seckillApi: function(args, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: seckillApi+args,
                withCredentials: true,
                data: {referer: 'tab.today'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('AdService', function($http, $ionicLoading) {
    var detailApi = _host + _adDetailApi;

    return {
        detail: function(id, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: detailApi+'?id='+id,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('CommentService', function($http, $ionicLoading) {
    var submitCommentUrl = _host + _submitCommentApi,
        itemCommentApi = _host + _itemCommentApi;

    return {
        get: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: itemCommentApi+'?setId='+data.id+'&pageNo='+data.page,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        submit: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: submitCommentUrl+data,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('CartService', function($http, $ionicLoading) {
    var addCartApi = _host + _addCartApi,
        getCartApi = _host + _getCartApi,
        getCartCountApi = _host + _getCartCountApi,
        setCartApi = _host + _setCartApi,
        getDiscountApi = _host + _getDiscountApi;

    return {
        all: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getCartApi,
                withCredentials: true,
                data: {referer: 'tab.cart'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        addCart: function(itemId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: addCartApi+'?set='+itemId+'&pcount=1',
                withCredentials: true,
                data: {referer: 'tab.today'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call();
            });
        },
        getCartCount: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getCartCountApi,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        setCart: function(item, townId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: setCartApi+'?set='+item.setId+'&pcount='+item.count+'&cartId='+item.id+'&townId='+townId,
                withCredentials: true
            }).success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getDiscountApi: function(townId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getDiscountApi+'?townId='+townId,
                withCredentials: true
            }).success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('OrderService', function($http, $ionicLoading) {
    var submitOrderApi = _host + _submitOrderApi,
        payOrderApi = _host + _payOrderApi,
        getOrderInfo = _host + _getOrderInfo,
        getOrderListApi = _host + _getOrderListApi,
        getCookieUrl = _host + _getCookie,
        setCookieUrl = _host + _setCookie,
        cancelOrderApi = _host + _cancelOrderApi;

    return {
        open4Pay: function(successCB) {
            console.log("OrderService="+getCookieUrl);
            $http({
                method: 'POST',
                url: getCookieUrl,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, JSON.stringify(data));
            });
        },
        resetCookie: function(json, successCB) {
            $http({
                method: 'POST',
                url: setCookieUrl + '?json=' + json,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this);
            });
        },
        submitOrder: function(carts, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: submitOrderApi+carts,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        payOrder: function(orderId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: getOrderInfo+'?id='+orderId,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getPayUrl: function(order) {
            return payOrderApi+'?orderNo='+order;
        },
        all: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getOrderListApi+'?status='+data.status+'&pageNo='+data.pageNo,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        cancelOrder: function(orderId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: cancelOrderApi+'?id='+orderId,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('MemberService', function($http, $ionicLoading) {
    var createAddressApi = _host + _createAddressApi,
        logoutApi = _host + _logoutApi,
        saveAddressApi = _host + _saveAddressApi,
        getAddressApi = _host + _getAddressApi,
        updatePasswordApi = _host + _updatePasswordApi,
        updateNicknameApi = _host + _updateNicknameApi,
        getMemberInfoApi = _host + _getMemberInfoApi,
        uploadAvatarApi = _host + _uploadAvatarApi,
        setDefaultAddressApi = _host + _setDefaultAddressApi;
        deleteAddressApi = _host + _deleteAddressApi,
        checkLoginApi = _host + _checkLoginApi;

    return {
        info: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getMemberInfoApi,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        createAddress: function(region, successCB) {
            if (region) {
                var url = createAddressApi+'?parent='+region.id;
            } else {
                var url = createAddressApi;
            }

            $ionicLoading.show();
            $http({
                method: 'GET',
                url: url,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        saveAddress: function(data, successCB) {
            $ionicLoading.show();
            var args = '?regionJson='+data.region+'&name='+data.address.contact+'&mobile='+data.address.mobile+'&floor='+data.address.floor+'&manualAddress='+data.address.manualAddress;
            $http({
                method: 'POST',
                url: saveAddressApi+args,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getAllAddress: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: getAddressApi,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        setDefaultAddress: function(addressId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: setDefaultAddressApi+'?id='+addressId,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        deleteAddress: function(addressId, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: deleteAddressApi+'?id='+addressId,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        logout: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: logoutApi,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call();
            });
        },
        updatePassword: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: updatePasswordApi+'?oldPwd='+data.old+'&newPwd='+data.new1,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        updateNickname: function(nickname, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: updateNicknameApi+'?nickname='+nickname,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        uploadAvatar: function(token, fileURL, successCB, errorCB) {
            var options = new FileUploadOptions();
            options.fileKey = 'file';
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = 'image/jpeg';
            options.headers = {'Token': token};

            var ft = new FileTransfer();
            ft.upload(fileURL, encodeURI(uploadAvatarApi) + '?token=' + token, successCB, errorCB, options);
        },
        checkLogin: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: checkLoginApi,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('BankService', function($http, $ionicLoading) {
    var rechargeExistsApi = _host + _rechargeExistsApi,
        rechargeSetPdApi = _host + _rechargeSetPdApi,
        rechargePageApi = _host + _rechargePageApi,
        rechargeDetailApi = _host + _rechargeDetailApi,
        rechargeDoApi = _host + _rechargeDoApi,
        rechargeResetPdApi = _host + _rechargeResetPdApi,
        rechargeGiftPayApi = _host + _rechargeGiftPayApi,
        rechargeGiftPayResultApi = _host + _rechargeGiftPayResultApi,
        rechargePrepareApi = _host + _rechargePrepareApi,
        rechargePayApi = _host + _rechargePayApi,
        rechargeFdpassMsgApi = _host + _rechargeFdpassMsgApi,
        rechargeFdpassApi = _host + _rechargeFdpassApi;

    return {
        exists: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: rechargeExistsApi,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        setpd: function(pass, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargeSetPdApi+'?pass='+pass,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        getInfo: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: rechargePageApi,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        billingList: function(pageNo, successCB) {
            $ionicLoading.show();
            $http({
                method: 'GET',
                url: rechargeDetailApi+'?pageNo='+pageNo,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        doRecharge: function(id, successCB) {
            $ionicLoading.show();
            console.log("doRecharge="+rechargeDoApi+'?setId='+id);
            $http({
                method: 'POST',
                url: rechargeDoApi+'?setId='+id,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        resetPd: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargeResetPdApi+'?oldPwd='+data.oldPwd+'&newPwd='+data.newPwd,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        payRecharge: function(id) {
            return rechargeGiftPayApi+'?recordId='+id;
        },
        payResult: function(id, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargeGiftPayResultApi+'?recordId='+id,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        prepare: function(id, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargePrepareApi+'?orderId='+id,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        pay: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargePayApi+'?orderId='+data.id+'&payPass='+data.payPass+'&walletMoney='+data.walletMoney,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        sendFindPassMsg: function(userName, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargeFdpassMsgApi+'?userName='+userName,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        },
        findPass: function(data, successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: rechargeFdpassApi+'?userName='+data.userName+'&verifyCode='+data.verifyCode+'&newPass='+data.newPass,
                withCredentials: true,
                data: {referer: 'tab.setting'}
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
})

.factory('CameraService', ['$q', function($q) {
    return {
        getPicture: function(options) {
            var q = $q.defer();

            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

.factory('AboutService', function($http, $ionicLoading) {
    var budingUrl = _host + _budingApi;

    return {
        about: function(successCB) {
            $ionicLoading.show();
            $http({
                method: 'POST',
                url: budingUrl,
                withCredentials: true
            })
            .success(function(data, status, headers, config, statusText) {
                successCB.call(this, data);
            });
        }
    }
});
