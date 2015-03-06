var currentStep = 1;
var selected = {
    boardId: -1,
    listIds: [],
    listNames: [],
};
var step1Content = $("#step1-content");
var step2Content = $("#step2-content");
var step3Content = $("#step3-content");

var step1Label = $("#step1-label");
var step2Label = $("#step2-label");
var step3Label = $("#step3-label");

var renderFlow = function() {
    $.get("static/templates/step3-flow.html", function(template) {
        var rendered = Mustache.render(template, {
            lists: selected.listNames
        });
        $("#step3-flow").html(rendered);
    });
};

var onBoardClicked = function() {
    $("#nextStep").removeClass("disabled");
    selected.boardId = this.id;
};

var onListClicked = function() {
    var index = selected.listIds.indexOf(this.id);
    if (index === -1) {
        selected.listIds.push(this.id);
        selected.listNames.push($("#" + this.id).parent().text().trim());
    } else {
        selected.listIds.splice(index, 1);
        selected.listNames.splice(index, 1);
    }

    if (selected.listIds.length > 0) {
        $("#nextStep").removeClass("disabled");
    }

    renderFlow();
};

var onStep = function() {
    step1Content.hide();
    step2Content.hide();
    step3Content.hide();
    step1Label.addClass("disabled");
    step2Label.addClass("disabled");
    step3Label.addClass("disabled");

    if (currentStep >= 2) {
        $("#nextStep").addClass("disabled");
    } else {
        $("#nextStep").removeClass("disabled");
    }

    if (currentStep == 2) {
        $("#prevStep").addClass("disabled");
    } else {
        $("#prevStep").removeClass("disabled");
    }

    if (currentStep == 1) {
        step1Label.removeClass("disabled");
        step1Content.show();
    }

    if (currentStep == 2) {
        step1Label.addClass("disabled");
        step1Content.hide();
        step2Label.removeClass("disabled");
        step2Content.show();
        $("#step2").click();
    }

    if (currentStep == 3) {
        step2Label.addClass("disabled");
        step2Content.hide();
        step3Label.removeClass("disabled");
        step3Content.show();
        $("#step3").click();
    }

    if (currentStep == 4) {
        window.location.href = "/visualize/index.html?boardId=" + selected.boardId + "&listIds=" + selected.listIds.join();
    }
};

$("#prevStep").click(function() {
    if (currentStep == 1)
        return;

    currentStep--;
    onStep();
});

$("#nextStep").click(function() {
    if (currentStep == 4)
        return;

    currentStep++;
    onStep();
});

var onAuthorize = function() {
    Trello.members.get("me", function(member) {
        $("#fullName").text(member.fullName);
        $("#nextStep").click();
    });
};

Trello.authorize({
    interactive: false,
    success: onAuthorize
});

$("#step2").click(function() {
    Trello.members.get("my/boards", function(boards) {
        $.get("static/templates/step2.html", function(template) {
            var rendered = Mustache.render(template, {
                boards: boards
            });
            $("#step2-target").html(rendered);
            $(".btn-board").change(onBoardClicked);
        });
    });
});

$("#step3").click(function() {
    Trello.get("boards/" + selected.boardId + "/lists", function(lists) {
        $.get("static/templates/step3.html", function(template) {
            var rendered = Mustache.render(template, {
                lists: lists
            });
            $("#step3-target").html(rendered);
            $(".btn-list").change(onListClicked);
        });
    });
});

$("#connectLink").click(function() {
    Trello.authorize({
        type: "popup",
        name: "TrellBan",
        expiration: "never",
        success: onAuthorize
    });
});
