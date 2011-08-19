(function() {
  var App, BaseScreen, ChatScreen, FollowList, HomeScreen, Screen2;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Ext.regModel('Room', {
    fields: ['name', 'label']
  });
  Ext.regModel('Message', {
    fields: ['user', 'message']
  });
  FollowList = (function() {
    __extends(FollowList, Ext.List);
    function FollowList() {
      FollowList.__super__.constructor.apply(this, arguments);
      this.reload();
    }
    FollowList.prototype.reload = function() {
      var store;
      store = this.getStore();
      return Ext.Ajax.request({
        url: '/rooms',
        success: function(res) {
          return store.loadData(JSON.parse(res.responseText));
        },
        failure: function() {
          return alert('error');
        }
      });
    };
    FollowList.prototype.store = new Ext.data.Store({
      model: 'Room'
    });
    FollowList.prototype.itemTpl = '<div class="contact"><strong>{label}</strong></div>';
    FollowList.prototype.onItemDisclosure = function(record, btn, index) {
      return new ChatScreen(record.get('name'), record.get('label'));
    };
    return FollowList;
  })();
  ChatScreen = (function() {
    __extends(ChatScreen, Ext.Panel);
    function ChatScreen(name, label) {
      var socket, store;
      ChatScreen.__super__.constructor.apply(this, arguments);
      this.dockedItems.items[0].setTitle(label);
      store = this.items.items[0].getStore();
      socket = io.connect(name);
      socket.on('message', function(msg) {
        return store.add(msg);
      });
      Ext.getCmp('submit_comment').setHandler(function() {
        var v;
        v = Ext.getCmp('comment').getValue();
        socket.emit('message', v);
        return Ext.getCmp('comment').setValue('');
      });
    }
    ChatScreen.prototype.fullscreen = true;
    ChatScreen.prototype.layout = 'fit';
    ChatScreen.prototype.dockedItems = [
      {
        dock: 'top',
        title: ChatScreen.label,
        xtype: 'toolbar',
        type: 'light'
      }, {
        dock: 'bottom',
        xtype: 'toolbar',
        type: 'light',
        items: [
          {
            id: 'comment',
            xtype: 'textfield'
          }, {
            id: 'submit_comment',
            text: '送信'
          }
        ]
      }
    ];
    ChatScreen.prototype.items = [
      {
        xtype: 'list',
        itemTpl: '{message}',
        store: new Ext.data.Store({
          model: 'Message'
        })
      }
    ];
    return ChatScreen;
  })();
  BaseScreen = (function() {
    __extends(BaseScreen, Ext.Panel);
    BaseScreen.prototype.title = 'Base panel';
    BaseScreen.prototype.iconCls = 'info';
    function BaseScreen(createHandler) {
      BaseScreen.__super__.constructor.apply(this, arguments);
      this.dockedItems.add(new Ext.Toolbar({
        dock: 'top',
        title: this.title,
        items: [
          {
            xtype: 'spacer'
          }, {
            xtype: 'button',
            ui: 'action',
            text: '作成',
            dock: 'right',
            handler: function() {
              return Ext.Msg.show({
                title: 'ルーム作成',
                msg: '名前を決めてください',
                width: 300,
                buttons: Ext.MessageBox.OK,
                multiLine: false,
                prompt: {
                  maxlength: 180,
                  autocapitalize: true
                },
                fn: function(btn, name) {
                  var socket;
                  socket = io.connect('/');
                  socket.on('roomCreated', function() {
                    return createHandler && createHandler();
                  });
                  return socket.emit('createRoom', {
                    label: name
                  });
                }
              });
            }
          }
        ]
      }));
    }
    return BaseScreen;
  })();
  HomeScreen = (function() {
    __extends(HomeScreen, BaseScreen);
    function HomeScreen() {
      HomeScreen.__super__.constructor.call(this, __bind(function() {
        return this.items.items[0].reload();
      }, this));
    }
    HomeScreen.prototype.title = 'ホーム';
    HomeScreen.prototype.items = [new FollowList];
    return HomeScreen;
  })();
  Screen2 = (function() {
    __extends(Screen2, BaseScreen);
    function Screen2() {
      Screen2.__super__.constructor.apply(this, arguments);
    }
    Screen2.prototype.title = 'Second screen';
    Screen2.prototype.html = 'Content of another screen';
    return Screen2;
  })();
  App = (function() {
    __extends(App, Ext.TabPanel);
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    App.prototype.fullscreen = true;
    App.prototype.tabBar = {
      dock: 'bottom',
      layout: {
        pack: 'left'
      }
    };
    App.prototype.items = [new HomeScreen, new Screen2];
    return App;
  })();
  Ext.setup({
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
      var app;
      return app = new App;
    }
  });
}).call(this);
