if (!String.prototype.autoLink) {
    String.prototype.autoLink = function() {
        var str = this, pattern = /(?!\[(?:img|url|code|gist|yt|youtube|noparse|video|music)[^\]]*?\])(^|\s+)((((ht|f)tps?:\/\/)|[www])([a-z\-0-9]+\.)*[\-\w]+(\.[a-z]{2,4})+(\/[\+%:\w\_\-\?\=\#&\.\(\)]*)*(?![a-z]))(?![^\[]*?\[\/(img|url|code|gist|yt|youtube|noparse|video|music)\])/gi, urls = [];
        try {
            urls = decodeURIComponent(this.replace(/%([^\d].)/g, "%25$1")).match(pattern);
        } catch (e) {}
        for (var i in urls) {
            if (urls[i].match(/\.(png|gif|jpg|jpeg)$/)) {
                str = str.replace(urls[i], "[img]" + (urls[i].match(/(^|\s+)https?:\/\//) ? "" : "http://") + urls[i] + "[/img]");
            } else {
                if (urls[i].match(/youtu\.?be|vimeo\.com|dai\.?ly(motion)?/) && !urls[i].match(/playlist/)) {
                    str = str.replace(urls[i], "[video]" + $.trim(urls[i]) + "[/video]");
                }
            }
        }
        return str.replace(pattern, "$1[url]$2[/url]").replace(/\[(\/)?noparse\]/gi, "");
    };
}

$(document).bind("mobileinit", function() {
    $.mobile.ajaxEnabled = false;
});

$(document).ready(function() {
    N.userTagDisplayTpl = '<li><img alt="${username_n}" class="gravatar-home" src="${gravatarurl_n}&amp;s=32" height="32" width="32"><div class="follow-list-container-home">${username_n}</div></li>';
    N.userTagInsertTpl = "[user]${username_n}[/user]";
    N.projectTagDisplayTpl = '<li><div class="follow-list-container-home">${name_n}</li>';
    N.projectTagInsertTpl = "[user]${username_n}[/user]";
    var bbCodes = {
        list: [ "s", "user", "project", "img", "b", "cur", "small", "big", "del", "u", "gist", "youtube", "yt", "m", "math", "quote", "spoiler", "url", "video", "twitter", "music", "i", {
            name: "url=",
            hasParam: true,
            useQuotes: true,
            paramDesc: "url"
        }, {
            name: "code",
            hasParam: true,
            paramDesc: "lang"
        }, {
            name: "wiki",
            hasParam: true,
            paramDesc: "lang"
        }, {
            name: "quote=",
            hasParam: true
        }, {
            name: "spoiler=",
            hasParam: true,
            paramDesc: "label"
        }, {
            name: "hr",
            isEmpty: true
        } ],
        byName: function(search) {
            if (search === "yt" || search === "youtube") {
                return "video";
            } else {
                if (search == "s") {
                    return "del";
                }
            }
            for (var i = 0; i < this.list.length; i++) {
                if (typeof this.list[i] === "object" && this.list[i].name === search || this.list[i] === search) {
                    return this.list[i];
                }
            }
            return null;
        },
        getNames: function() {
            var ret = [];
            for (var i = 0; i < this.list.length; i++) {
                ret.push(typeof this.list[i] === "object" ? this.list[i].name : this.list[i]);
            }
            return ret;
        }
    };
    window.interactiveStoreName = "autocompletion";
    window.interactiveEmptyStore = {
        users: {},
        projects: {}
    };
    window.interactiveRemoteFilter = function(type) {
        return function(query, callback) {
            if (sessionStorage[interactiveStoreName]) {
                var store = JSON.parse(sessionStorage[interactiveStoreName]);
                if (store[type][query]) {
                    callback(store[type][query]);
                    return;
                }
            } else {
                sessionStorage[interactiveStoreName] = JSON.stringify(interactiveEmptyStore);
            }
            if (query.length < 2) {
                callback(JSON.parse(sessionStorage[interactiveStoreName])[type][query]);
                return;
            }
            $.getJSON("/i/" + type + ".ajax.php", {
                q: query,
                count: 10
            }, function(data) {
                var store = JSON.parse(sessionStorage[interactiveStoreName]);
                store[type][query] = data;
                sessionStorage[interactiveStoreName] = JSON.stringify(store);
                callback(data);
            });
        };
    };
    window.interactiveBeforeInsert = function(type) {
        return function(val, $li) {
            $li.data("final", val).data("index", "[/" + (type == "users" ? "user" : "project") + "]");
            return val;
        };
    };
    window.interactiveSorter = function(query, items, key) {
        return items;
    };
    $(window).on("beforeunload", function() {
        if (!$("#postlist").length) {
            return;
        }
        var areas = $("textarea");
        for (var ta in areas) {
            var val = $.trim(areas[ta].value) || "";
            if (val !== "") {
                areas[ta].focus();
                return N.getLangData().MESSAGE_NOT_SENT;
            }
        }
    });
    var autoLink = function(form) {
        $(form).find("textarea").each(function(index, textarea) {
            textarea.value = textarea.value.autoLink();
        });
    };
    $("form").bind("submit", function(e) {
        autoLink(this);
    });
    $("aside").css("height", $(window).height() - 42);
    $(window).resize(function() {
        $("aside").css("height", $(window).height() - 42);
    });
    if (!$("#left_col").length) {
        $("#title_left").hide();
    }
    $("#title_left").click(function() {
        $("#right_col").removeClass("shown").animate({
            left: "100%"
        }, 500);
        if (!$("#left_col").hasClass("shown")) {
            $("#left_col").css("left", "-70%").show().animate({
                left: "0%"
            }, 500, function() {
                $(this).addClass("shown");
            });
        } else {
            $("#left_col").animate({
                left: "-70%"
            }, 500, function() {
                $(this).removeClass("shown").hide();
            });
        }
        return false;
    });
    $("#title_right").click(function() {
        $("#left_col").removeClass("shown").animate({
            left: "-70%"
        }, 500);
        if (!$("#right_col").hasClass("shown")) {
            $("#right_col").css("left", "100%").show().animate({
                left: "30%"
            }, 500, function() {
                $(this).addClass("shown");
            });
        } else {
            $("#right_col").animate({
                left: "100%"
            }, 500, function() {
                $(this).removeClass("shown").hide();
            });
        }
        return false;
    });
    $("iframe").attr("scrolling", "no");
    $("body").on("click", "a", function(e) {
        if ($(this).attr("href") && $(this).attr("href").match(/^https?:\/\/(?:www|mobile)\.nerdz\.eu\/.*/)) {
            e.preventDefault();
            $(this).attr("onclick", "").attr("href", $(this).attr("href").replace(/^(https?:\/\/)www(\.nerdz\.eu\/.*)/, "$1mobile$2").replace("https", "http"));
        }
    });
    $("#rightmenu_title").click(function() {
        $("#rightmenu").toggleClass("ninja");
    });
    $(document).on("taphold", "input[type=submit]", function(e) {
        e.preventDefault();
        window.open("/bbcode.php");
    });
    var append_theme = "", _h = $("head");
    if (localStorage.getItem("has-dark-theme") === "yep") {
        append_theme = "?skin=sons-of-obsidian";
    }
    var prettify = document.createElement("script");
    prettify.type = "text/javascript";
    prettify.src = "https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/run_prettify.js" + append_theme;
    _h.append(prettify);
    if (append_theme !== "") {
        _h.append('<style type="text/css">.nerdz-code-wrapper { background-color: #000; color: #fff; }</style>');
    } else {
        _h.append('<style type="text/css">.nerdz-code-wrapper { background-color: #eee; color: #000; }</style>');
    }
    $("#notifycounter").on("click", function(e) {
        e.preventDefault();
        if ($("#pm_list").length) {
            $("#pm_list").remove();
        }
        var list = $("#notify_list"), old = $(this).html();
        var nold = parseInt(old);
        if (list.length) {
            if (isNaN(nold) || nold === 0) {
                list.remove();
            } else {
                if (nold > 0) {
                    list.prepend('<div id="pr_lo">' + N.getLangData().LOADING + "</div>");
                    N.html.getNotifications(function(d) {
                        $("#pr_lo").remove();
                        list.prepend(d);
                    });
                }
            }
        } else {
            var l = $(document.createElement("div"));
            l.attr("id", "notify_list");
            l.html(N.getLangData().LOADING);
            $("body").append(l);
            N.html.getNotifications(function(d) {
                l.html(d);
            });
            $("#notify_list").on("click", ".notref", function(e) {
                if (e.ctrlKey) {
                    return;
                }
                e.preventDefault();
                var href = $(this).attr("href");
                if (href === window.location.pathname + window.location.hash) {
                    location.reload();
                } else {
                    location.href = href;
                }
            });
        }
        $(this).html(isNaN(nold) ? old : "0");
    });
    var wrongPages = [ "/bbcode.php", "/terms.php", "/faq.php", "/stats.php", "/rank.php", "/preferences.php", "/informations.php", "/preview.php" ];
    if ($.inArray(location.pathname, wrongPages) != -1) {
        $("#footersearch").hide();
    }
    window.getParameterByName = function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    $("#footersearch").on("submit", function(e) {
        e.preventDefault();
        var qs = $.trim($("#footersearch input[name=q]").val());
        if (qs === "") {
            return false;
        }
        qs = encodeURIComponent(qs);
        var plist = $("#postlist");
        var type = window.getParameterByName("type");
        if (type === "") {
            type = plist.data("type");
        }
        type = encodeURIComponent(type);
        var loc = window.getParameterByName("location");
        if (loc === "") {
            loc = plist.data("location");
        }
        loc = encodeURIComponent(loc);
        var id = window.getParameterByName("id");
        if (id === "") {
            id = plist.data("id");
        }
        id = encodeURIComponent(id);
        window.location.href = "search.php?q=" + qs + "&type=" + type + "&location=" + loc + "&id=" + id;
    });
    $("#logout").on("click", function(event) {
        event.preventDefault();
        var t = $("#logout");
        N.json.logout({
            tok: $(this).data("tok")
        }, function(r) {
            var tmp = t.html();
            if (r.status === "ok") {
                t.html(r.message);
                setTimeout(function() {
                    document.location.href = "/";
                }, 1500);
            } else {
                t.html("<h2>" + r.message + "</h2>");
                setTimeout(function() {
                    t.html(tmp);
                }, 1500);
            }
        });
    });
    pm_default_f = '<a href="/pm.php#inbox" id="pm_all">See All Conversations</a>';
    var c_from, c_to;
    $("#pmcounter").on("click", function(e) {
        if ($("#notify_list").length) {
            $("#notify_list").remove();
        }
        e.preventDefault();
        var list = $("#pm_list"), old = $(this).html();
        var nold = parseInt(old);
        if (list.length) {
            b = $("#pm_list_b");
            if (isNaN(nold) || nold === 0) {
                list.remove();
            } else {
                if (nold > 0) {
                    b.html(N.getLangData().LOADING);
                    N.html.pm.getInbox(function(data) {
                        b.html(data);
                        $(b.children()[0]).children().slice(0, nold).css("background-color", "#EEE");
                        $(b.children()[0]).children().slice(5).remove();
                    });
                }
            }
        } else {
            var l = $(document.createElement("div"));
            l.attr("id", "pm_list");
            t = $('<div id="pm_list_t">').html('<div id="pm_from">Conversations</div>' + '<span id="pm_conv"></span><span id="pm_reply"></span><span id="pm_new"></span>');
            b = $('<div id="pm_list_b">' + N.getLangData().LOADING + "</div>");
            f = $('<div id="pm_list_f">' + pm_default_f + "</div>");
            l.append(t).append(b).append(f);
            $("body").append(l);
            N.html.pm.getInbox(function(data) {
                b.html(data.replace(/(<br \/>)*/g, ""));
                $(b.children()[0]).children().slice(0, nold).css("background-color", "#EEE");
                $(b.children()[0]).children().slice(5).remove();
            });
            t.on("click", "#pm_new", function() {
                b.html(N.getLangData().LOADING);
                N.html.pm.getForm(function(data) {
                    b.html(data).trigger("create");
                    $("#to").focus();
                });
                c_from = false;
                $("#pm_new").hide();
                $("#pm_conv").show();
            });
            t.on("click", "#pm_conv", function() {
                b.html(N.getLangData().LOADING);
                N.html.pm.getInbox(function(data) {
                    b.html(data.replace(/(<br \/>)*/g, ""));
                    $(b.children()[0]).children().slice(5).remove();
                });
                $("#pm_new").show();
                $("#pm_reply, #pm_conv").hide();
            });
            t.on("click", "#pm_reply", function(data) {
                b.html(N.getLangData().LOADING);
                N.html.pm.getForm(function(data) {
                    b.html(data).children().trigger("create");
                    to = $("#pm_reply").data("to");
                    $("#to").val(to).attr("disabled", "disabled");
                    $("#message").focus();
                });
                $("#pm_new").hide();
                $("#pm_conv").show();
            });
            b.on("click", ".getconv", function(e) {
                b.html(N.getLangData().LOADING);
                e.preventDefault();
                c_from = $(this).data("from");
                c_to = $(this).data("to");
                $("#pm_from").text($(this).text());
                $("#pm_reply").data("to", $(this).text());
                N.html.pm.getConversation({
                    from: c_from,
                    to: c_to,
                    start: 0,
                    num: 4
                }, function(data) {
                    b.html(data);
                    $("#pm_new").hide();
                    $("#pm_reply, #pm_conv").show();
                    b.children("#convfrm").remove();
                });
            });
            b.on("submit", "#convfrm", function(e) {
                e.preventDefault();
                setTimeout(function() {
                    f.html(pm_default_f);
                }, 1500);
                if (!$("#to").val()) {
                    f.text("Missing Adressee");
                    return;
                }
                if (!$("#message").val()) {
                    f.text("Missing Message");
                    return;
                }
                N.json.pm.send({
                    to: $("#to").val(),
                    message: $("#message").val()
                }, function(d) {
                    f = $("#pm_list_f");
                    f.text(d.status);
                    if (d.status === "ok") {
                        f.text("Message Send");
                        if (c_from) {
                            N.html.pm.getConversation({
                                from: c_from,
                                to: c_to,
                                start: 0,
                                num: 4
                            }, function(data) {
                                b.html(data);
                                $("#pm_new").hide();
                                $("#pm_reply, #pm_conv").show();
                                b.children("#convfrm").remove();
                            });
                        } else {
                            $("#message").val("");
                        }
                    }
                });
            });
            f.on("click", "#pm_all", function(e) {
                e.preventDefault();
                var href = $(this).attr("href");
                if (nold) {
                    if (href.split("#")[0] === window.location.pathname) {
                        location.hash = "new";
                        location.reload();
                    } else {
                        location.href = "/pm.php#new";
                    }
                } else {
                    location.href = href;
                }
            });
        }
        $(this).html(isNaN(nold) ? old : "0");
    });
    $("ul.topnav li a.rightarrow").on("click", function(e) {
        e.preventDefault();
        $(this).parent().find("ul.subnav").toggle("fast");
    });
    $("#nerdzcrush-file").on("change", function(e) {
        e.preventDefault();
        var $me = $(this), progress = $("#" + $me.data("progref"));
        progress.show();
        NERDZCrush.upload(document.getElementById("nerdzcrush-file").files[0], function(media) {
            var file = document.getElementById("nerdzcrush-file").files[0];
            if(!file) {
                progress.hide();
                return;
            }
            var ext = file.name.split(".").pop().toLowerCase();
            var tag = "url";
            if (file.type.indexOf("image") > -1) {
                tag = ext != "gif" ? "img" : "video";
            } else if (file.type.indexOf("audio") > -1) {
                tag = "music";
            } else if (file.type.indexOf("video") > -1) {
                tag = "video";
            }

            var $area = $("#" + $me.data("refto"));
            progress.hide();
            var msg = "[" + tag + "]https://media.nerdz.eu/" + media.hash + "." + ext + "[/" + tag + "]";
            var cpos = $area[0].selectionStart, val = $area.val(), intx = val.substring(0, cpos) + msg;
            $area.focus();
            $area.val(intx + val.substring(cpos));
            $area[0].setSelectionRange(intx.length, intx.length);
            $me.val("");
        }, function(e) {
            if (e.lengthComputable) {
                progress.val((e.loaded / e.total) * 100);
            }
        });
    });
    var handleUpload = function(me, e) {
        e.preventDefault();
        var progref = "ref" + Math.round(Math.random() * 100) + "pro";
        var refto = me.parent().parent().find("textarea").attr("id");
        me.find("progress").remove();
        $("#"+refto).parent().append("<progress id='" + progref + "' style='height: 3px; width:100%; display:none' max='100' value='0'></progress>");
        $("#nerdzcrush-file").data("progref", progref).data("refto", refto).click();
    };
    $(".nerdzcrush-upload").on("click", function(e) {
        handleUpload($(this), e);
    });
    var handleFolUn = function(me, d, oldValue) {
        me.html(d.message);
        if (d.status == "ok") {
            me.off("click");
        } else {
            setTimeout(function() {
                me.html(oldValue);
            }, 1500);
        }
    };
    $("#follow, .follow").click(function() {
        var me = $(this), oldValue = me.html();
        me.html("...");
        var type = me.hasClass("project") ? "project" : "profile";
        N.json[type].follow({
            id: $(this).data("id")
        }, function(d) {
            handleFolUn(me, d, oldValue);
        });
    });
    $("#unfollow, .unfollow").click(function() {
        var me = $(this), oldValue = me.html();
        me.html("...");
        var type = me.hasClass("project") ? "project" : "profile";
        N.json[type].unfollow({
            id: $(this).data("id")
        }, function(d) {
            handleFolUn(me, d, oldValue);
        });
    });
    $("ul.topnav li a.rightarrow").on("click", function(e) {
        e.preventDefault();
        $(this).parent().find("ul.subnav").toggle("fast");
    });
    $("body").on("focus", "textarea", function() {
        var $me = $(this), next_offset = [], old_len = 0, fired = false;
        if ($me.data("ac-enabled")) {
            return;
        }
        $me.data("ac-enabled", true);
        $me.atwho({
            at: "@",
            displayTpl: N.userTagDisplayTpl,
            insertTpl: N.userTagInsertTpl,
            callbacks: {
                sorter: window.interactiveSorter,
                remoteFilter: window.interactiveRemoteFilter("users")
            }
        }).atwho({
            at: "[",
            data: bbCodes.getNames(),
            callbacks: {
                beforeInsert: function(val, $li) {
                    var bbcode = bbCodes.byName($li.data("value")), what, indch;
                    if (typeof bbcode !== "object") {
                        what = "[" + bbcode + "][/" + bbcode + "]";
                        indch = "]";
                    } else {
                        var name = bbcode.name.replace(/=$/, "");
                        what = "[" + name;
                        if (bbcode.hasParam) {
                            what += "=" + (bbcode.useQuotes ? '""' : "");
                            indch = bbcode.useQuotes ? '"' : "=";
                        } else {
                            indch = "]";
                        }
                        what += "]";
                        if (!bbcode.isEmpty) {
                            what += "[/" + name + "]";
                        }
                    }
                    $li.data("index", indch).data("final", what);
                    return what;
                },
                tplEval: function(tpl, map) {
                    var base = "<li data-value='" + map.name + "'>", bbcode = bbCodes.byName(map.name), isObj = typeof bbcode === "object";
                    map.name = map.name.replace(/=$/, "");
                    base += "[" + map.name;
                    if (isObj && bbcode.hasParam) {
                        base += "=" + (bbcode.paramDesc ? bbcode.paramDesc : "...");
                    }
                    base += "]";
                    if (!isObj || !bbcode.isEmpty) {
                        base += "...[/" + map.name + "]";
                    }
                    return base + "</li>";
                },
                highlighter: function(li, query) {
                    if (!query) {
                        return li;
                    }
                    return li.replace(new RegExp(">(.+?)(" + query.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1") + ")", "gi"), function(s, $1, $2) {
                        if ($1 === "[") {
                            $1 = "";
                            $2 = "[" + $2;
                        }
                        return ">" + $1 + "<strong>" + $2 + "</strong>";
                    });
                },
                matcher: function(flag, subtext) {
                    var match;
                    match = /\[([A-Za-z0-9_+-=\]]*)$/gi.exec(subtext);
                    if (match) {
                        return match[1];
                    }
                    return null;
                }
            }
        }).atwho({
            at: "[user]",
            displayTpl: N.userTagDisplayTpl,
            insertTpl: "[user]${username_n}",
            callbacks: {
                sorter: window.interactiveSorter,
                remoteFilter: window.interactiveRemoteFilter("users"),
                beforeInsert: window.interactiveBeforeInsert("users")
            }
        }).atwho({
            at: "[project]",
            displayTpl: N.projectTagDisplayTpl,
            insertTpl: "[project]${name_n}",
            callbacks: {
                sorter: window.interactiveSorter,
                remoteFilter: window.interactiveRemoteFilter("projects"),
                beforeInsert: window.interactiveBeforeInsert("projects")
            }
        }).on("inserted.atwho", function(e, $li) {
            var str = $li.data("final"), $me = $(this), pos = $me.caret("pos"), v = $me.val(), index;
            $me.val(v.substr(0, pos - 1) + v.substr(pos));
            if (!$li.data("final")) {
                return;
            }
            index = str.indexOf($li.data("index"));
            next_offset = pos - str.length;
            if ($li.data("index") !== "]") {
                next_offset += str.indexOf("]");
            } else {
                next_offset += str.indexOf("]", index + 1);
            }
            old_len = $(this).val().length;
            if (index === -1) {
                return;
            }
            $(this).caret("pos", pos - str.length + index);
            fired = true;
        }).atwho({
            at: "[user]",
            displayTpl: N.userTagDisplayTpl,
            insertTpl: "[user]${username_n}",
            callbacks: {
                sorter: window.interactiveSorter,
                remoteFilter: window.interactiveRemoteFilter("users"),
                beforeInsert: window.interactiveBeforeInsert("users")
            }
        }).atwho({
            at: "[project]",
            displayTpl: N.projectTagDisplayTpl,
            insertTpl: "[project]${name_n}",
            callbacks: {
                sorter: window.interactiveSorter,
                remoteFilter: window.interactiveRemoteFilter("projects"),
                beforeInsert: window.interactiveBeforeInsert("projects")
            }
        }).on("keydown", function(e) {
            if (next_offset !== -1 && e.which === 9 && !fired) {
                e.preventDefault();
                $(this).caret("pos", next_offset);
                next_offset = -1;
                old_len = 0;
            } else {
                if (fired) {
                    fired = false;
                }
            }
        }).on("keyup", function() {
            if (next_offset !== -1) {
                var $me = $(this), curr = $me.val().length, delta = curr - old_len;
                old_len = curr;
                next_offset += delta;
                if ($me.caret("pos") >= next_offset) {
                    next_offset = -1;
                    old_len = 0;
                }
            }
        });
    });
    var plist = $("#postlist");
    plist.on("click", ".qu_user", function(e) {
        e.preventDefault();
        $(this).parent().toggleClass("qu_main-extended");
    });
    plist.on("submit", "form", function(e) {
        autoLink(this);
    });
    window.fixHeights = function() {
        plist.find(".nerdz_message, .news").each(function() {
            var el = $(this).find("div:first");
            if ((el.height() >= 200 || el.find(".gistLoad").length > 0) && !el.data("parsed")) {
                el.data("real-height", el.height()).addClass("compressed");
                var n = el.next();
                n.prepend('<a class="more">&gt;&gt; ' + N.getLangData().EXPAND + " &lt;&lt;</a>");
            }
            el.attr("data-parsed", "1");
        });
    };
    plist.on("click", ".nerdzcrush-upload", function(e) {
        handleUpload($(this), e);
    });
    plist.on("click", ".more", function() {
        var me = $(this), par = me.parent(), jenk = par.prev();
        if (me.data("busy") == "godyes") {
            return;
        }
        me.data("busy", "godyes");
        jenk.animate({
            maxHeight: jenk.data("real-height")
        }, 500, function() {
            jenk.removeClass("compressed").css("max-height", "none");
            me.slideUp("slow", function() {
                me.remove();
            });
        });
    });
    plist.on("click", "ul.topnav li a:nth-of-type(1)", function(e) {
        e.preventDefault();
        $(this).parent().find("ul.subnav").toggle("fast");
    });
    plist.on("click", ".yt_frame", function(e) {
        e.preventDefault();
        N.yt($(this), $(this).data("vid"));
    });
    plist.on("click", ".delcomment", function(e) {
        e.preventDefault();
        var refto = $("#" + $(this).data("refto"));
        var hcid = $(this).data("hcid");
        var popup = $("<div>");
        popup.html(N.getLangData().ARE_YOU_SURE + " <br />");
        $("<button>").attr("id", "delCommOk" + hcid).html("YES").appendTo(popup);
        $("<button>").attr("id", "delCommNo" + hcid).html("NO").appendTo(popup);
        popup.on("click", "#delCommOk" + hcid, function() {
            N.json[plist.data("type")].delComment({
                hcid: hcid
            }, function(j) {
                if (j.status === "ok") {
                    refto.fadeOut(function() {
                        $(this).remove();
                    });
                    popup.fadeOut(function() {
                        $(this).remove();
                    });
                } else {
                    popup.html(j.message);
                }
            });
        }).on("click", "#delCommNo" + hcid, function() {
            popup.remove();
        });
        popup.attr("class", "ui-content").css({
            backgroundColor: "#eee",
            color: "#111",
            padding: "15px"
        }).popup({
            positionTo: "window"
        }).popup("open");
    });
    plist.on("submit", ".frmcomment", function(e) {
        e.preventDefault();
        var last, hcid, hpid = $(this).data("hpid"), refto = $("#commentlist" + hpid), error = $(this).find(".error").eq(0), pattern = 'div[id^="c"]', comments = refto.find(pattern);
        if (comments.length) {
            last = comments.length > 1 ? comments.eq(comments.length - 2) : null;
            hcid = last ? last.data("hcid") : 0;
        }
        error.html(N.getLangData().LOADING);
        N.json[plist.data("type")].addComment({
            hpid: hpid,
            message: $(this).find("textarea").eq(0).val()
        }, function(d) {
            if (d.status === "ok") {
                if (hcid && last) {
                    N.html[plist.data("type")].getCommentsAfterHcid({
                        hpid: hpid,
                        hcid: hcid
                    }, function(d) {
                        var form = refto.find("form.frmcomment").eq(0), pushBefore = form.parent(), newComments = $("<div>" + d + "</div>").find(pattern), internalLengthPointer = comments.length, lastComment = comments.last();
                        if (comments.length > 1) {
                            comments.eq(comments.length - 1).remove();
                            internalLengthPointer--;
                        }
                        if (lastComment.data("hcid") === newComments.last().data("hcid")) {
                            lastComment.remove();
                            internalLengthPointer--;
                        }
                        while (internalLengthPointer + newComments.length > ((comments.parent().find(".more_btn").data("morecount") || 0) + 1) * 10) {
                            comments.first().remove();
                            comments = refto.find(pattern);
                            internalLengthPointer--;
                        }
                        pushBefore.before(d);
                        form.find("textarea").val("").parent().trigger("create");
                        error.html("");
                    });
                } else {
                    N.html[plist.data("type")].getComments({
                        hpid: hpid,
                        start: 0,
                        num: 10
                    }, function(d) {
                        refto.html(d).trigger("create");
                        error.html("");
                    });
                }
            } else {
                error.html(d.message);
            }
        });
    });
    plist.on("click", ".showcomments", function() {
        var refto = $("#" + $(this).data("refto"));
        if (refto.html() === "") {
            refto.html(N.getLangData().LOADING + "...");
            N.html[plist.data("type")].getComments({
                hpid: $(this).data("hpid"),
                start: 0,
                num: 10
            }, function(res) {
                refto.html(res).trigger("create");
                if (document.location.hash === "#last") {
                    refto.find(".frmcomment textarea[name=message]").focus();
                } else {
                    if (document.location.hash) {
                        $.mobile.silentScroll($(document.location.hash).offset().top);
                    }
                }
            });
        } else {
            refto.html("");
        }
    });
    plist.on("click", ".oldrev", function() {
        var me = $(this), refto = $(this).data("refto");
        var revno = parseInt($(this).data("revisions"));
        var func = "getRevision";
        var obj = {
            hpid: $(this).data("hpid"),
            revNo: revno
        };
        var id = "hpid";
        if (me.hasClass("comment")) {
            func = "getCommentRevision";
            obj = {
                hcid: $(this).data("hcid"),
                revNo: revno
            };
            id = "hcid";
        }
        if (!$(this).data("original-rev")) {
            $(this).data("original-rev", revno);
        }
        if (revno > 0) {
            N.json[plist.data("type")][func](obj, function(r) {
                var tagTime = me.parent().parent(), timeVal = null;
                if (id === "hcid") {
                    tagTime = tagTime.find('a[id^="ndc"]');
                } else {
                    tagTime = tagTime.find("time");
                }
                timeVal = tagTime.html();
                tagTime.html(r.datetime);
                if (!me.parent().find(".newrev").length) {
                    var s = $(document.createElement("a"));
                    s.attr("class", "newrev" + (id === "hcid" ? " comment" : ""));
                    s.attr("data-refto", refto);
                    s.attr("data-" + id, me.data(id));
                    s.html("&#9654;&nbsp;");
                    me.parent().append(s);
                }
                var div = null, pidTag = null;
                if (id === "hcid") {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("a"));
                    pidTag.append(div.find(".delcomment"));
                    pidTag.html(pidTag.html() + "#1");
                    pidTag.css("font-size", "0");
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    pidTag = $("#" + refto).find(".nerdz_message span:first");
                    if (!div.length) {
                        div = $("#" + refto).find(".news div:first");
                        pidTag = $("#" + refto).find(".news span:first");
                    }
                    pidTag.remove();
                }
                var storeName = plist.data("type") + "store" + func;
                var elms = {};
                if (!sessionStorage[storeName]) {
                    elms[me.data(id)] = [];
                    elms[me.data(id)][revno] = {};
                    elms[me.data(id)][revno].message = div.html();
                    elms[me.data(id)][revno].time = timeVal;
                    sessionStorage[storeName] = JSON.stringify(elms);
                } else {
                    elms = JSON.parse(sessionStorage[storeName]);
                    if (!elms[me.data(id)]) {
                        elms[me.data(id)] = [];
                    }
                    if (!elms[me.data(id)][revno]) {
                        elms[me.data(id)][revno] = {};
                        elms[me.data(id)][revno].message = div.html();
                        elms[me.data(id)][revno].time = timeVal;
                        sessionStorage[storeName] = JSON.stringify(elms);
                    }
                }
                div.html(r.message);
                if (pidTag.html().search(/^#\d+$/) != -1) {
                    pidTag.html(pidTag.html() + " - rev: " + revno);
                } else {
                    pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                        return $1 + ": " + revno;
                    }));
                }
                div.prepend(pidTag);
                var rev = revno - 1;
                me.data("revisions", rev);
                if (rev === 0) {
                    me.hide();
                }
            });
        }
    });
    plist.on("click", ".newrev", function() {
        var me = $(this), refto = $(this).data("refto");
        var func = "getRevision";
        var id = "hpid";
        var tagTime = me.parent().parent().find("time");
        if (me.hasClass("comment")) {
            func = "getCommentRevision";
            id = "hcid";
            tagTime = me.parent().parent().children('a[id^="ndc"]');
        }
        var storeName = plist.data("type") + "store" + func;
        if (sessionStorage[storeName]) {
            var elms = JSON.parse(sessionStorage[storeName]);
            if (elms[me.data(id)]) {
                if (id === "hcid") {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("span"));
                    pidTag.append(div.find(".delcomment"));
                    pidTag.html(pidTag.html() + "#1");
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    if (!div.length) {
                        div = $("#" + refto).find(".news div:first");
                    }
                    pidTag = div.find("span:first");
                    pidTag.remove();
                }
                elms[me.data(id)] = elms[me.data(id)].filter(function(v) {
                    return v !== null;
                });
                div.html(elms[me.data(id)][0].message);
                tagTime.html(elms[me.data(id)][0].time);
                elms[me.data(id)][0] = null;
                elms[me.data(id)] = elms[me.data(id)].filter(function(v) {
                    return v !== null;
                });
                sessionStorage[storeName] = JSON.stringify(elms);
                var d = me.parent().find(".oldrev");
                var rev = parseInt(d.data("revisions")) + 1;
                d.data("revisions", rev);
                pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                    return $1 + ": " + (rev == 1 ? rev + 1 : rev);
                }));
                if (id === "hcid") {
                    pidTag.css("font-size", "0");
                }
                div.prepend(pidTag);
                if (rev >= parseInt(d.data("original-rev"))) {
                    me.remove();
                    pidTag.html(pidTag.html().replace(/(#\d+).*:\s*(\d+)/, function($0, $1, $2) {
                        return $1;
                    }));
                }
                d.show();
            }
        }
    });
    plist.on("click", ".vote", function() {
        var curr = $(this), cont = curr.parent(), tnum = cont.parent().children(".thumbs-counter"), func = "thumbs", obj = {
            hpid: cont.data("refto")
        };
        if (cont.hasClass("comment")) {
            obj = {
                hcid: cont.data("refto")
            };
            func = "cthumbs";
        }
        if (curr.hasClass("voted")) {
            N.json[plist.data("type")][func]($.extend(obj, {
                thumb: 0
            }), function(r) {
                if (r.status === "error") {
                    alert(r.message);
                } else {
                    curr.removeClass("voted");
                    var votes = parseInt(r.message);
                    tnum.attr("class", "thumbs-counter").text(votes);
                    if (votes !== 0) {
                        tnum.addClass(votes > 0 ? "nerdz_thumbsNumPos" : "nerdz_thumbsNumNeg");
                    }
                    if (votes > 0) {
                        tnum.text("+" + tnum.text());
                    }
                }
            });
        } else {
            N.json[plist.data("type")][func]($.extend(obj, {
                thumb: curr.hasClass("up") ? 1 : -1
            }), function(r) {
                if (r.status === "error") {
                    alert(r.message);
                } else {
                    cont.children(".voted").removeClass("voted");
                    curr.addClass("voted");
                    var votes = parseInt(r.message);
                    tnum.attr("class", "thumbs-counter").text(votes);
                    if (votes !== 0) {
                        tnum.addClass(votes > 0 ? "nerdz_thumbsNumPos" : "nerdz_thumbsNumNeg");
                    }
                    if (votes > 0) {
                        tnum.text("+" + tnum.text());
                    }
                }
            });
        }
    });
    plist.on("click", ".more_btn", function() {
        var moreBtn = $(this), commentList = moreBtn.parents('div[id^="commentlist"]'), hpid = /^post(\d+)$/.exec(commentList.parents('div[id^="post"]').attr("id"))[1], intCounter = moreBtn.data("morecount") || 0;
        if (moreBtn.data("inprogress") === "1") {
            return;
        }
        moreBtn.data("inprogress", "1").text(N.getLangData().LOADING + "...");
        N.html[plist.data("type")].getComments({
            hpid: hpid,
            start: intCounter + 1,
            num: 10
        }, function(r) {
            moreBtn.data("inprogress", "0").data("morecount", ++intCounter).text(moreBtn.data("localization"));
            var _ref = $("<div>" + r + "</div>");
            moreBtn.parent().after(r);
            if (intCounter === 1) {
                moreBtn.parent().find(".scroll_bottom_hidden").show();
            }
            if ($.trim(r) === "" || _ref.find(".nerdz_from").length < 10 || 10 * (intCounter + 1) === _ref.find(".commentcount:eq(0)").html()) {
                var btnDb = moreBtn.hide().parent();
                btnDb.find(".scroll_bottom_separator").hide();
                btnDb.find(".all_comments_hidden").hide();
            }
        });
    });
    plist.on("click", ".scroll_bottom_btn", function() {
        var cList = $(this).parents().eq(2);
        $.mobile.silentScroll(cList.find(".singlecomment:nth-last-child(2)").offset().top);
        cList.find(".frmcomment textarea").focus();
    });
    plist.on("click", ".all_comments_btn", function() {
        var btn = $(this), btnDb = btn.parent().parent(), moreBtn = btnDb.find(".more_btn"), commentList = btn.parents('div[id^="commentlist"]'), hpid = /^post(\d+)$/.exec(commentList.parents('div[id^="post"]').attr("id"))[1];
        if (btn.data("working") === "1" || moreBtn.data("inprogress") === "1") {
            return;
        }
        btn.data("working", "1").text(N.getLangData().LOADING + "...");
        moreBtn.data("inprogress", "1");
        N.html[plist.data("type")].getComments({
            hpid: hpid,
            forceNoForm: true
        }, function(res) {
            btn.data("working", "0").text(btn.data("localization")).parent().hide();
            btnDb.find(".scroll_bottom_hidden").show().find(".scroll_bottom_separator").hide();
            var parsed = $("<div>" + res + "</div>"), push = $("#commentlist" + hpid);
            moreBtn.hide().data("morecount", Math.ceil(parseInt(parsed.find(".commentcount").html()) / 10));
            push.find('div[id^="c"]').remove();
            push.find("form.frmcomment").eq(0).parent().before(res);
        });
    });
    plist.on("click", ".qu_ico", function() {
        var area = $("#" + $(this).data("refto")), msg = "[quote=" + $(this).data("hcid") + "|" + $(this).data("type") + "]", cpos = area[0].selectionStart, val = area.val(), intx = val.substring(0, cpos) + msg;
        area.focus();
        area.val(intx + val.substring(cpos));
        area[0].setSelectionRange(intx.length, intx.length);
    });
    plist.on("click", ".delpost", function(e) {
        e.preventDefault();
        var refto = $("#" + $(this).data("refto"));
        var hpid = $(this).data("hpid");
        N.json[plist.data("type")].delPostConfirm({
            hpid: hpid
        }, function(m) {
            if (m.status === "ok") {
                var popup = $("<div>");
                popup.html(m.message + "<br />");
                $("<button>").attr("id", "delPostOk" + hpid).html("YES").appendTo(popup);
                $("<button>").attr("id", "delPostNo" + hpid).html("NO").appendTo(popup);
                popup.on("click", "#delPostOk" + hpid, function() {
                    N.json[plist.data("type")].delPost({
                        hpid: hpid
                    }, function(j) {
                        if (j.status === "ok") {
                            refto.fadeOut(function() {
                                $(this).remove();
                            });
                            popup.fadeOut(function() {
                                $(this).remove();
                            });
                        } else {
                            popup.html(j.message);
                        }
                    });
                }).on("click", "#delPostNo" + hpid, function() {
                    popup.remove();
                });
                popup.attr("class", "ui-content").css({
                    backgroundColor: "#eee",
                    color: "#111",
                    padding: "15px"
                }).popup({
                    positionTo: "window"
                }).popup("open");
            }
        });
    });
    plist.on("click", ".close", function(e) {
        e.preventDefault();
        var refto = $("#" + $(this).data("refto"));
        var hpid = $(this).data("hpid");
        var me = $(this), arrow = me.children();
        me.html("...");
        N.json[plist.data("type")].closePost({
            hpid: hpid
        }, function(m) {
            if (m.status != "ok") {
                alert(m.message);
            } else {
                refto.css("color", "red");
                me.html(N.getLangData().OPEN);
                me.append(arrow);
                me.attr("class", "open");
            }
        });
    });
    plist.on("click", ".open", function(e) {
        e.preventDefault();
        var refto = $("#" + $(this).data("refto"));
        var hpid = $(this).data("hpid");
        var me = $(this), arrow = me.children();
        me.html("...");
        N.json[plist.data("type")].openPost({
            hpid: hpid
        }, function(m) {
            if (m.status != "ok") {
                alert(m.message);
            } else {
                refto.css("color", "");
                me.html(N.getLangData().CLOSE);
                me.append(arrow);
                me.attr("class", "close");
            }
        });
    });
    plist.on("click", ".edit", function(e) {
        e.preventDefault();
        var refto = $("#" + $(this).data("refto")), hpid = $(this).data("hpid");
        var getF = "getPost", editF = "editPost";
        var getObj = {
            hpid: hpid
        };
        var editObj = {
            hpid: hpid
        };
        var id = hpid;
        var type = "hpid";
        if ($(this).hasClass("comment")) {
            type = "hcid";
            getF = "getComment";
            editF = "editComment";
            var hcid = $(this).data("hcid");
            getObj = {
                hcid: hcid
            };
            editObj = {
                hcid: hcid
            };
            id = hcid;
        }
        var form = function(fid, id, message, prev, type) {
            return '<form style="margin-bottom:40px" id="' + fid + '" data-' + type + '="' + id + '">' + '<textarea id="' + fid + 'abc" autofocus style="width:99%; height:125px">' + message + "</textarea><br />" + '<input type="submit" value="' + N.getLangData().EDIT + '" style="float: right; margin-top:5px" />' + "</form>";
        };
        N.json[plist.data("type")][getF](getObj, function(d) {
            var fid = refto.attr("id") + "editform";
            refto.html(form(fid, id, d.message, $(".preview").html(), type));
            $("#" + fid).on("submit", function(e) {
                e.preventDefault();
                N.json[plist.data("type")][editF]($.extend(editObj, {
                    message: $(this).children("textarea").val()
                }), function(d) {
                    if (d.status == "ok") {
                        refto.slideToggle("slow");
                        N.html[plist.data("type")][getF](getObj, function(o) {
                            refto.html(o);
                            refto.slideToggle("slow");
                            if (typeof N.getLangData().HIDE != "undefined") {
                                $(refto.find("ul.subnav")[0]).append('<li><a class="hide" data-postid="post' + id + '"><span class="rightarrow"></span>' + N.getLangData().HIDE + "</a></li>");
                            }
                        });
                    } else {
                        alert(d.message);
                    }
                });
            });
        });
    });
    plist.on("click", ".imglocked", function(e) {
        e.preventDefault();
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "imgunlocked").attr("title", d.message);
            }
        };
        if ($(this).data("silent")) {
            N.json[plist.data("type")].reNotifyFromUserInPost({
                hpid: $(this).data("hpid"),
                from: $(this).data("silent")
            }, function(d) {
                tog(d);
            });
        } else {
            N.json[plist.data("type")].reNotifyForThisPost({
                hpid: $(this).data("hpid")
            }, function(d) {
                tog(d);
            });
        }
    });
    plist.on("click", ".imgunlocked", function(e) {
        e.preventDefault();
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "imglocked").attr("title", d.message);
            }
        };
        if ($(this).data("silent")) {
            N.json[plist.data("type")].noNotifyFromUserInPost({
                hpid: $(this).data("hpid"),
                from: $(this).data("silent")
            }, function(d) {
                tog(d);
            });
        } else {
            N.json[plist.data("type")].noNotifyForThisPost({
                hpid: $(this).data("hpid")
            }, function(d) {
                tog(d);
            });
        }
    });
    plist.on("click", ".lurk", function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "unlurk").attr("title", d.message);
            }
        };
        e.preventDefault();
        N.json[plist.data("type")].lurkPost({
            hpid: $(this).data("hpid")
        }, function(d) {
            tog(d);
        });
    });
    plist.on("click", ".unlurk", function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "lurk").attr("title", d.message);
            }
        };
        e.preventDefault();
        N.json[plist.data("type")].unlurkPost({
            hpid: $(this).data("hpid")
        }, function(d) {
            tog(d);
        });
    });
    plist.on("click", ".bookmark", function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "unbookmark").attr("title", d.message);
            }
        };
        e.preventDefault();
        N.json[plist.data("type")].bookmarkPost({
            hpid: $(this).data("hpid")
        }, function(d) {
            tog(d);
        });
    });
    plist.on("click", ".unbookmark", function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === "ok") {
                me.attr("class", "bookmark").attr("title", d.message);
            }
        };
        e.preventDefault();
        N.json[plist.data("type")].unbookmarkPost({
            hpid: $(this).data("hpid")
        }, function(d) {
            tog(d);
        });
    });
    plist.on("click", ".nerdz-code-title", function() {
        localStorage.setItem("has-dark-theme", localStorage.getItem("has-dark-theme") == "yep" ? "nope" : "yep");
        document.location.reload();
    });
    plist.on("click", ".nerdz-code-title a", function(e) {
        e.stopPropagation();
    });
    setInterval(function() {
        var nc = $("#notifycounter"), val = parseInt(nc.html());
        nc.css("background-color", val === 0 || isNaN(val) ? "#eee" : "#2C98C9");
        var pc = $("#pmcounter");
        val = parseInt(pc.html());
        pc.css("background-color", val === 0 || isNaN(val) ? "#eee" : "#2C98C9");
    }, 200);
});
