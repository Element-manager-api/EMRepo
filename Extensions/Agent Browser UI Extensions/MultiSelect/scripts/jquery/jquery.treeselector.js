(function ($) {
  jQuery.fn.treeSelector = function (tree, defaultValues, onChange, params) {
    // autoclose
    if (!window.treeSelector_autoclose_FN) {
      $(window).on('click blur', function (e) {
        // console.info('window', e.target, $(e.target).closest('.treeSelector-container'));
        var isClickSelector = $(e.target).closest('.treeSelector-container').length > 0
        if (!isClickSelector) {
          $('div.treeSelector-wrapper').removeClass('visible')
          if (options.search) {
            var $searchbox = $('div.treeSelector-wrapper').find('.ms-search input:first');
            $searchbox.val('');
            $searchbox.trigger('keyup');
          }
          var $inputBox = $('div.treeSelector-input-box:first')
          ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(200, $inputBox.height() + $('#multiSelectError').height() + 40);
        }
      })
    }

    // options
    var options = $.extend({
      // children checked/unchecked if true
      checkWithParent: MultiSelectConstants.HIER_DD_checkWithParent ? MultiSelectConstants.HIER_DD_checkWithParent : false,
      // title with 'title1 - title 2' if true
      titleWithParent: MultiSelectConstants.HIER_DD_titleWithParent ? MultiSelectConstants.HIER_DD_titleWithParent : false,
      // when item click, only view leaf title if true
      notViewClickParentTitle: MultiSelectConstants.HIER_DD_notViewClickParentTitle ? MultiSelectConstants.HIER_DD_notViewClickParentTitle : false,
      disabled: false,
      search: false,
      // search filter options
      searchOptions: {
        'default': MultiSelectConstants.SEARCH_TEXT ? MultiSelectConstants.SEARCH_TEXT : 'Search',             // search input placeholder text
        onSearch: function (element) { } // fires on keyup before search on options happens
      },
      selectedText: MultiSelectConstants.SELECTED_TEXT ? MultiSelectConstants.SELECTED_TEXT : ' selected', // add select all option
      closedRightArrow: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
      closedLeftArrow: '<i class="fa fa-caret-left" aria-hidden="true"></i>',
      openedArrow: '<i class="fa fa-caret-down" aria-hidden="true"></i>',
      expandHandler: function (target, expanded) { },
      placeholder: MultiSelectConstants.PLACEHOLDER ? MultiSelectConstants.PLACEHOLDER : 'Select options',
      emptyOptonPlaceholder: MultiSelectConstants.NO_OPTIONS ? MultiSelectConstants.NO_OPTIONS : 'no options',
      minHeight: MultiSelectConstants.HIER_DD_MIN_HEIGHT ? MultiSelectConstants.HIER_DD_MIN_HEIGHT : 200,   // minimum height of option overlay
      maxHeight: null,  // maximum height of option overlay
      expandAll: MultiSelectConstants.HIER_DD_EXPAND_ALL ? MultiSelectConstants.HIER_DD_EXPAND_ALL : false,
      expandAllText: MultiSelectConstants.HIER_DD_EXPAND_ALL_TEXT ? MultiSelectConstants.HIER_DD_EXPAND_ALL_TEXT : 'Expand All',
      collapseAllText: MultiSelectConstants.HIER_DD_COLLAPSE_ALL_TEXT ? MultiSelectConstants.HIER_DD_COLLAPSE_ALL_TEXT : 'Collapse All'
    }, params)

    /**
     * iterate to gen node
     * @param {*} node 
     * @param {*} level 
     */
    var buildTree = function (node, level) {
      var hasChildren = node.children && node.children.length > 0

      var li = $(document.createElement('li'));
      li.addClass('treeSelector-li level-' + level + (hasChildren ? ' has-children' : ''))
      var liBox = $(document.createElement('div'));
      liBox.addClass('treeSelector-li-box')

      var liTitle = $(document.createElement('label'));
      liTitle.addClass('treeSelector-li-title-box')
      liTitle.attr({
        for: 'treeSelector-li-' + node.id,
        'data-value': node.value,
        'data-title': node.title,
        'title': node.title
      })
      if (hasChildren) {
        var liArrowSpan = $(document.createElement('span'));
        liArrowSpan.addClass('arrow');
        liArrowSpan.addClass('collapsed');
        if ($(document.body)[0].dir == "ltr")
          liArrowSpan.html(options.closedRightArrow);
        else
          liArrowSpan.html(options.closedLeftArrow);
        liBox.append(liArrowSpan);
      }
      var liTitleCheckbox = $(document.createElement('input'));
      liTitleCheckbox.attr({ type: 'checkbox', id: 'treeSelector-li-' + node.id, 'data-value': node.value })
      liTitle.append(liTitleCheckbox)

      var liTitleSpan = $(document.createElement('span'));
      liTitleSpan.addClass('treeSelector-li-title')
      liTitleSpan.attr({ 'data-value': node.value })
      liTitleSpan.text(node.title)
      liTitle.append(liTitleSpan)

      liBox.append(liTitle)

      if (hasChildren) {
        var liChildUl = $(document.createElement('ul'));
        liChildUl.attr({ 'style': 'display:none' });
        var childrenLis = $()
        for (var k = 0; k < node.children.length; k++) {
          childrenLis = childrenLis.add(buildTree(node.children[k], level + 1))
        }
        liChildUl.append(childrenLis)
        liBox.append(liChildUl)
      } else {
        liBox.addClass('leaf')
      }

      li.append(liBox)

      return li
    }

    var getParentTitles = function ($seletor, value) {
      if (!value) {
        return []
      }
      var titles = []
      var valueItem = $seletor.find('.treeSelector-li-title-box[data-value=' + value + ']:first')
      if (valueItem && valueItem.closest('.treeSelector-li').length > 0) {
        var closeLiBox = valueItem.closest('.treeSelector-li')
          .closest('.treeSelector-li-box')
        var closeTitle = closeLiBox.find('>.treeSelector-li-title-box').attr('data-title')
        var closeValue = closeLiBox.find('>.treeSelector-li-title-box').attr('data-value')
        var tmpTitles = getParentTitles($seletor, closeValue).slice()
        titles = tmpTitles.concat([closeTitle])
      }
      return titles.filter(function (e) { return e })
    }

    /**
     * view values(titles)
     * @param {*} $selector 
     * @param {*} values 
     */
    var appendSelectedItems = function ($selector, values) {
      // console.info('appendSelectedItems', Array.isArray(values), typeof(values));
      if ($selector && values && Array.isArray(values)) {
        var titles = []
        var titleSpans = $()
        for (var k = 0; k < values.length; k++) {
          var value = values[k];
          var item = $selector.find('.treeSelector-li-title[data-value=' + value + ']:first')
          if (item && item.length > 0) {
            item.prev('input[type=checkbox]').prop('checked', true)
            item.prev('input[type=checkbox]').addClass('selected')
            item.parents('div.treeSelector-li-box').children('span.arrow').each(function () {
              if ($(this).hasClass('collapsed')) {
                $(this).removeClass('collapsed')
              }
              if (!$(this).hasClass('expanded')) {
                $(this).addClass('expanded')
              }
              $(this)[0].innerHTML = options.openedArrow;
            })
            item.parents('ul').show()
            // titles.push([item.text(), value])
            var titleItem = $(document.createElement('div'));
            titleItem.addClass('title-item')
            titleItem.attr({ 'data-value': value })
            var itemSpan = $(document.createElement('span'));
            itemSpan.addClass('title')
            var title = item.text()
            if (options.titleWithParent) {
              var itemParentTitles = getParentTitles($selector, value)
              title = itemParentTitles.concat([title]).filter(function (e) { return e }).join(' - ')
            }
            itemSpan.text(title)
            var faClose = $(document.createElement('span'));
            faClose.addClass('fa fa-times')

            titleItem.append(faClose)
            titleItem.append(itemSpan)
            titleSpans = titleSpans.add(titleItem)
          }
        }
        //console.info('titles', titles, titleSpans);
        if (titleSpans.length < 1) {
          $selector.find('.treeSelector-input-box:first').empty().append(options.placeholder)
        }
        else if (titleSpans.length < 4) {
          $selector.find('.treeSelector-input-box:first').empty().append(titleSpans)
        } else {
          $selector.find('.treeSelector-input-box:first').empty().append(titleSpans.length + options.selectedText)
        }
      }
    }

    /**
     * get current values
     * @param {*} $selector 
     */
    var getCheckedInputValues = function ($selector) {
      return $selector.find('input[type=checkbox]:checked')
        .map(function (_index, elem) { return $(elem).attr('data-value') })
        .toArray()
    }

    /**
     * set checked = false to parents
     * @param {Element} inputCheckbox 
     */
    var uncheckParent = function (inputCheckbox) {
      var closeUl = $(inputCheckbox).closest('ul')
      if (closeUl && closeUl.length) {
        var checkbox = closeUl.prev('.treeSelector-li-title-box').find('input[type=checkbox]:first')
        checkbox.prop('checked', false)
        var chckBoxSelected = checkbox.hasClass('selected')
        if (chckBoxSelected) {
          checkbox.removeClass('selected')
        }
        uncheckParent(checkbox.get(0))
      }
    }

    /**
     * reset titles when vaule change actions
     * @param {*} $selector 
     */
    var valueChangeEventView = function ($selector, event) {
      var values = getCheckedInputValues($selector)
      // on view leaf titles
      if (options.notViewClickParentTitle) {
        var leafValues = []
        for (var k = 0; k < values.length; k++) {
          var value = values[k];
          var valueLeafInput = $selector.find('.treeSelector-li-box.leaf input[data-value=' + value + ']')
          if (valueLeafInput.length > 0) {
            leafValues.push(value)
          } else {
            var liBox = $('label.treeSelector-li-title-box[data-value=' + value + ']:first')
            if (liBox.length > 0 && liBox.next('ul').find('input[type=checkbox]:checked').length > 0) {
              console.info('value 333', value);
            } else {
              leafValues.push(value)
            }
          }
        }
        // console.info('leafValues', leafValues);
        appendSelectedItems($selector, leafValues)
        onChange && onChange(event, values)
      } else {
        appendSelectedItems($selector, values)
        onChange && onChange(event, values)
      }
    }

    /**
     * events
     * @param {*} $selector 
     */
    var bindEvents = function ($selector) {
      $selector.on('change', 'input[type=checkbox]', function (e) {
        if (options.disabled) {
          return false
        }
        if (options.checkWithParent) {
          var childrenBox = $(e.target)
            .parent('.treeSelector-li-title-box')
            .next('ul')
          if (e.target.checked) {
            if (childrenBox && childrenBox.length > 0) {
              childrenBox.find('input[type=checkbox]').prop('checked', e.target.checked)
              childrenBox.find('input[type=checkbox]').addClass('selected');
            }
            e.target.classList.add('selected');
          } else {
            e.target.classList.remove('selected');
            uncheckParent(e.target)
            if (childrenBox && childrenBox.length > 0) {
              childrenBox.find('input[type=checkbox]').prop('checked', e.target.checked)
              childrenBox.find('input[type=checkbox]').removeClass('selected');
            }
          }
        }

        valueChangeEventView($selector, e)
      })

      $selector.on('click', 'span.fa.fa-times', function (e) {
        if (options.disabled) {
          return false
        }
        var value = $(e.target).parent('.title-item').attr('data-value')
        // console.info('value', value, $(e.target), $selector.find('input[type=checkbox][data-value=' + value + ']:checked'));
        var input = $selector.find('input[type=checkbox][data-value=' + value + ']:checked')
        if (input && input.length) {
          input.prop('checked', false)
          input.removeClass('selected')
          if (options.checkWithParent) {
            uncheckParent(input.get(0))
          }
        }

        valueChangeEventView($selector, e)
        return false
      })

      //arrow click handler close/open
      $selector.on("click", ".arrow", function (e) {
        if (options.disabled || !tree || !tree.length) {
          return false
        }
        e.stopPropagation();
        $(this).empty();
        var expanded;
        if ($(this).parents("li").first().find("ul").first().is(":visible")) {
          expanded = false;
          $(this).addClass('collapsed');
          $(this).removeClass('expanded');
          if ($(document.body)[0].dir == "ltr")
            $(this).prepend(options.closedRightArrow);
          else
            $(this).prepend(options.closedLeftArrow);
          $(this).parents("li").first().find("ul").first().hide();
        } else {
          expanded = true;
          $(this).prepend(options.openedArrow);
          $(this).addClass('expanded');
          $(this).removeClass('collapsed');
          $(this).parents("li").first().find("ul").first().show();
        }
        resizeExt(200, parseFloat(window.frameElement.parentElement.style.height) - 5);
        options.expandHandler($(this).parents("li").first(), expanded);
      });

      $selector.on('click', '.treeSelector-input-box', function (e) {
        if (options.disabled || !tree || !tree.length) {
          return false
        }
        // console.info('click', e.target);
        var $wrapper = $selector.find('.treeSelector-wrapper:first')
        var isOpen = $wrapper.hasClass('visible');
        var $inputBox = $selector.find('.treeSelector-input-box:first');
        if (!isOpen) {
          $wrapper.addClass('visible')
          resizeExt(200, $inputBox.height() + $inputBox.next().height() + 40);
        } else {
          $wrapper.removeClass('visible')
          ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(200, $inputBox.height() + $('#multiSelectError').height() + 40);
          if (options.search) {
            var $searchbox = $wrapper.find('.ms-search input:first');
            $searchbox.val('');
            $searchbox.trigger('keyup');
          }
        }
      });

      $selector.on('keyup', '.ms-search input', function () {
        var search = $(this);
        // ignore keystrokes that don't make a difference
        if ($(this).data('lastsearch') == $(this).val()) {
          return true;
        }


        $(this).data('lastsearch', $(this).val());

        // USER CALLBACK
        if (typeof options.searchOptions.onSearch == 'function') {
          options.searchOptions.onSearch($('div.treeSelector-wrapper'));
        }

        var $wrapper = $selector.find('.treeSelector-wrapper:first')
        var optionsList = $wrapper.find('li.treeSelector-li');
        optionsList.each(function () {
          var optText = $(this).find('div > .treeSelector-li-title-box:first')[0].getAttribute('data-title')
          // show option if string exists
          if (optText.toLowerCase().indexOf(search.val().toLowerCase()) > -1) {
            $(this).show();
            $(this).parents('li').show();
            $(this).parents('ul').show();
            $(this).parents('div.treeSelector-li-box').children('span.arrow').each(function () {
              $(this)[0].innerHTML = options.openedArrow;
            })
          } else {
            $(this).hide();
          }
        });
        resizeExt(200, parseFloat(window.frameElement.parentElement.style.height) - 5);
      });

      $selector.on('click', '.ms-expandall', function () {
        var nodes = $selector.find('span.arrow');
        if ($(this).hasClass('global')) {
          // only expand those which are not already expanded
          if (nodes.filter(':not(.expanded)').length) {
            nodes.filter(':not(.expanded)').trigger('click');
            $(this).html(options.collapseAllText);
          }
          // collapse everything
          else {
            nodes.trigger('click');
            $(this).html(options.expandAllText);
          }
        }
      });
    }

    return $(this).each(function () {
      var selector = $(document.createElement('div'));
      selector.addClass('treeSelector-container');
      if (options.disabled) {
        selector.addClass('disabled');
      }

      var selectorInputBox = $(document.createElement('div'));
      selectorInputBox.addClass('treeSelector-input-box');
      selectorInputBox.text(options.placeholder);
      var selectorWrapper = $(document.createElement('div'));
      selectorWrapper.addClass('treeSelector-wrapper');
      var selectorWrapperUl = $(document.createElement('ul'))

      selector.append(selectorInputBox)
      selector.append(selectorWrapper)
      if (options.search) {
        var searchDiv = $(document.createElement('div'));
        searchDiv.addClass('ms-search');
        var searchBox = $(document.createElement('input'))
        searchBox.attr('type', 'text')
        searchBox.attr('value', '')
        searchBox.attr('placeholder', options.searchOptions['default'])
        searchDiv.append(searchBox);
        selectorWrapper.append(searchDiv)
      }
      if (options.expandAll) {
        var expandAllNode = $(document.createElement('a'));
        expandAllNode.attr('href', '#');
        expandAllNode.attr('class', 'ms-expandall global');
        expandAllNode.html(options.expandAllText);
        selectorWrapper.append(expandAllNode)
      }
      if (tree && tree.length) {
        for (var j = 0; j < tree.length; j++) {
          var element = buildTree(tree[j], 0)
          selectorWrapperUl.append(element)
        }
      } else {
        selector.addClass('no-options')
        selectorInputBox.text(options.emptyOptonPlaceholder)
      }

      selectorWrapper.append(selectorWrapperUl);
      $(this).empty().append(selector);
      var maxHeight = ($(window).height() - selectorWrapper.offset().top - 20);
      if (options.maxHeight) {
        maxHeight = ($(window).height() - selectorWrapper.offset().top - 20);
        maxHeight = maxHeight < options.minHeight ? options.minHeight : maxheight;
      }

      maxHeight = maxHeight < options.minHeight ? options.minHeight : maxHeight;

      selectorWrapper.css({
        maxHeight: maxHeight
      })
      // console.info('defaultValues', defaultValues);
      if (defaultValues && defaultValues.length) {
        //console.info('defaultValues22', defaultValues);
        appendSelectedItems(selector, defaultValues)
      }
      bindEvents(selector)
    })
  }
})(jQuery);