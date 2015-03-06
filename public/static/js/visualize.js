var selected = {
    boardId: -1,
    listIds: [],
    listNames: [],
};

var data = {
    leadTime: 0,
    cycleTime: 0,
    throughPut: 0
};

var getQueryVariable = function(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return (false);
};

var dayDiff = function(startDate, stopDate) {
    var timeDiff = Math.abs(stopDate.getTime() - startDate.getTime());
    return timeDiff / (1000 * 3600 * 24);
};

var calculateLeadTime = function() {
    var listId = selected.listIds[selected.listIds.length - 1];
    Trello.get("lists/" + listId + "?cards=all", function(cardsResult) {
        var cardCount = cardsResult.cards.length;
        var days = 0;
        $.each(cardsResult.cards, function(index, card) {
            Trello.get("cards/" + card.id + "/actions/?filter=createCard,updateCard:idList", function(actionsResult) {
                if (actionsResult.length > 1) {
                    var lastDate = new Date(actionsResult[0].date);
                    var firstDate = new Date(actionsResult[actionsResult.length - 1].date);
                    var diff = dayDiff(lastDate, firstDate);
                    days += diff;
                    if (days > 0) {
                        data.leadTime = days / cardCount;
                    }

                    $.get("../static/templates/visualize.html", function(template) {
                        var rendered = Mustache.render(template, {
                            data: data
                        });
                        $("#metrics").html(rendered);
                    });

                    console.log("card.name", card.name);
                    console.log("lastDate", lastDate);
                    console.log("firstDate", firstDate);
                    console.log("days", days);
                    console.log("data.leadTime", data.leadTime);
                }
            });
        });

        // if (days === 0)
        //     days = 1;

        // data.leadTime = Math.ceil(days / cardCount);
        // $.get("../static/templates/visualize.html", function(template) {
        //     var rendered = Mustache.render(template, {
        //         data: data
        //     });
        //     $("#metrics").html(rendered);
        // });
    });
};

var onAuthorize = function() {
    selected.boardId = getQueryVariable("boardId");
    selected.listIds = getQueryVariable("listIds").split(",");

    calculateLeadTime();
};

$(document).ready(function() {
    Trello.authorize({
        interactive: false,
        success: onAuthorize
    });
});
