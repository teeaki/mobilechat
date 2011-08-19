Ext.regModel('Room',
    fields: ['name', 'label']
);
Ext.regModel('Message', {
    fields: ['user', 'message']
});

class FollowList extends Ext.List
	constructor: ->
		super
		@reload()
	reload: ->
		store = @getStore()
		Ext.Ajax.request(
			url:'/rooms',
			success: (res) ->
				store.loadData JSON.parse(res.responseText)
			failure: ->
				alert('error')
		)
	store: new Ext.data.Store(model: 'Room')
	itemTpl: '<div class="contact"><strong>{label}</strong></div>'
	onItemDisclosure: (record, btn, index) ->
		new ChatScreen record.get('name'), record.get('label')
		
class ChatScreen extends Ext.Panel
	constructor: (name, label) ->
		super
		@dockedItems.items[0].setTitle(label);
		store = @items.items[0].getStore();
		#socket = io.connect(location.origin + name);
		socket = io.connect(name);
		socket.on 'message', (msg) ->
			store.add(msg);
		Ext.getCmp('submit_comment').setHandler ->
			v = Ext.getCmp('comment').getValue()
			socket.emit('message', v);
			Ext.getCmp('comment').setValue('');
	fullscreen: true
	layout: 'fit'
	dockedItems: [
		{dock: 'top'
		title: @label
		xtype: 'toolbar'
		type: 'light'},
		{dock: 'bottom',
		xtype: 'toolbar',
		type: 'light',
		items: [{
			id: 'comment',
			xtype: 'textfield'},{
			id:'submit_comment'
			text: '送信',}
		]}
	],
	items: [{
		xtype: 'list'
		itemTpl : '{message}'
		store: new Ext.data.Store(model: 'Message')
	}]

class BaseScreen extends Ext.Panel
	title: 'Base panel'
	iconCls: 'info'
	constructor: (createHandler) ->
		super
		@dockedItems.add(
			new Ext.Toolbar(
				dock: 'top'
				title: @title
				items:[
					{ xtype: 'spacer' }
					{xtype: 'button',
					ui: 'action',
					text: '作成',
					dock: 'right',
					handler: ->
						Ext.Msg.show(
							title: 'ルーム作成',
							msg: '名前を決めてください',
							width: 300,
							buttons: Ext.MessageBox.OK,
							multiLine: false,
							prompt : { maxlength : 180, autocapitalize : true },
							fn: (btn, name) ->
								#socket = io.connect(location.origin)
								socket = io.connect('/')
								socket.on('roomCreated', ->
									createHandler && createHandler()
								)
								socket.emit('createRoom', {label:name})
						)
					}
				]
			)
		)

class HomeScreen extends BaseScreen
	constructor: ->
		super =>
			@items.items[0].reload()
	title: 'ホーム'
	items: [new FollowList]

class Screen2 extends BaseScreen
	title: 'Second screen'
	html: 'Content of another screen'

class App extends Ext.TabPanel
	fullscreen: true
	tabBar:
		dock: 'bottom'
		layout: pack: 'left'
	items: [new HomeScreen, new Screen2]

Ext.setup
	icon: 'icon.png'
	glossOnIcon: false
	onReady: ->
		app = new App
