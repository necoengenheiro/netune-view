yum.define([
    Pi.Url.create('Music', '/list.js'),
    Pi.Url.create('Music', '/popup.js'),
    Pi.Url.create('Music', '/page.js'),
    Pi.Url.create('Music', '/editor.js'),
    Pi.Url.create('Music', '/model.js'),
    Pi.Url.create('Omni', '/client.js'),
    Pi.Url.create('User', '/model.js'),
    Pi.Url.create('User', '/page.js'),
    Pi.Url.create('Workspace', '/page.js')
], function () {

    class App extends Pi.App {

        instances() {
            this.pages = [];

            this.env = 'full';
            this.omniGroupName = 'netune:cifras';

            this.omni = new Omni.Client();
            this.omni.connect();
        }

        viewDidLoad() {
            this.initFramework7();
            this.initComponents();

            this.initEnv();
            this.loadUser();

            super.viewDidLoad();
        }

        servicesWillLoad() {

        }

        initFramework7() {
            this.f7 = new Framework7({
                el: '#' + this.view.id,
                name: 'Netune',
                id: 'br.com.atos239.netune',
                sortable: {
                    moveElements: true
                }
            });
        }

        initComponents() {
            this.musicPopup = new Music.Popup();
            this.musicPopup.render(this.view.get('musicPopup'));

            this.musicList = new Music.List({
                empty: 'Nenhuma Música Adicionada'
            });

            this.musicList.render(this.view.get('musicList'));
        }

        initEnv() {
            if (this.env != 'full') {
                this.view.findById('addMusic').hide();
                this.view.findById('createMusic').hide();
            }
        }

        loadWorkspace() {
            app.loading(true);
            this.user.loadWorkspace().ok((workspace) => {
                app.loading(false);

                this.musicList.clear();
                this.musicList.load(workspace.musicas);

                this.setWorkspace(workspace);
            });
        }

        loadUser() {
            app.loading(true);
            User.Model.current().ok((user) => {
                app.loading(false);

                this.setUser(user);
                this.loadWorkspace();

                super.servicesWillLoad();
            });
        }

        setUser(user) {
            app.user = user;
            this.view.get('avatarUrl').src = user.avatar;
        }

        setWorkspace(w) {
            this.view.get('workspaceNome').set(w.nome);
        }

        openModal(modal) {
            modal.render(app.view.element);
            modal.open();

            return modal;
        }

        addPage(page) {
            this.pages.push(page);
            page.render(this.view.get('pages'));

            return page;
        }

        get currentPage() {
            if (this.pages.length == 0) return null;
            return this.pages[this.pages.length - 1];
        }

        popPage() {
            this.currentPage.destroy();
            this.pages.pop();
            window.location = '#';
        }

        loading(b) {
            if (b) app.f7.preloader.show();
            else app.f7.preloader.hide();

            return this;
        }

        notification(title, subtitle = '', message = '') {
            var n = app.f7.notification.create({
                title: title,
                subtitle: subtitle,
                text: message,
                closeButton: true,
            });

            n.open();
        }

        prompt(title, text, ok, cn) {
            this.f7.dialog.prompt(text, title, ok, cn).open();
        }

        saveWorkspace() {
            this.user.workspace.musicas = this.musicList.get();

            this.loading(true);
            this.user.workspace.save().done(() => {
                this.loading(false);

                this.omni.trigger('reload:workspace', this.omniGroupName, this.user.workspace);
            }).error(() => {
                app.notification('Atenção!', 'Sem conexão com a internet');
            });
        }

        events(listen) {
            super.events(listen);

            listen({
                '#changeUser click'() {
                    this.addPage(new User.Page()).event.listen('update', () => {
                        this.setUser(app.user);
                    });
                },

                '#changeWorkspace click'() {
                    this.addPage(new Workspace.Page()).event.listen('select', () => {
                        this.loadWorkspace()
                    });
                },

                '#addMusic click'() {
                    this.musicPopup.open();
                },

                '#createMusic click'() {
                    this.addPage(new Music.Editor({
                        musica: new Music.Model()
                    }));
                },

                '{omni} connected'() {
                    this.omni.enter(this.omniGroupName);
                },

                '{omni} reload:workspace'(workspace) {
                    if (this.user.workspace.id == workspace.id) {
                        this.loadWorkspace(workspace.id);
                    }
                },

                '{omni} new:tom'(musica) {
                    for (let i = 0; i < this.user.workspace.musicas.length; i++) {
                        const m = this.user.workspace.musicas[i];
                        if (m.id == musica.id) {
                            this.loadWorkspace(this.user.workspace.id);
                            break;
                        }
                    }
                },

                '{omni} update:musica'(musica) {
                    for (let i = 0; i < this.user.workspace.musicas.length; i++) {
                        const m = this.user.workspace.musicas[i];
                        if (m.id == musica.id) {
                            this.loadWorkspace(this.user.workspace.id);
                            break;
                        }
                    }
                },

                '{this} save:music'(musica) {
                    for (let i = 0; i < this.user.workspace.musicas.length; i++) {
                        const m = this.user.workspace.musicas[i];
                        if (m.id == musica.id) {
                            this.loadWorkspace(this.user.workspace.id);
                            break;
                        }
                    }
                },

                '{musicPopup} choose'(musicas) {
                    this.musicList.load(musicas);

                    this.saveWorkspace();
                },

                '{musicList} delete'() {
                    this.saveWorkspace();
                },

                '{musicList} select'(musica) {
                    this.addPage(new Music.Page({
                        musica: musica
                    }));
                },

                '{musicList} reorder'(){
                    this.saveWorkspace();
                }
            });
        }
    }

    Pi.Export('App', App);
});