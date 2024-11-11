jQuery(document).ready(function($) {
    // API Ayarları Kilidi Açma
    $('#unlock-api-settings').on('click', function(e) {
        e.preventDefault();
        
        if (!confirm(xautoposter.strings.confirm_unlock)) {
            return;
        }

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'xautoposter_reset_api_verification',
                nonce: xautoposter.nonce
            },
            beforeSend: function() {
                $('#unlock-api-settings').prop('disabled', true);
            },
            success: function(response) {
                if (response.success) {
                    $('input[name^="xautoposter_options"]').prop('readonly', false);
                    $('.api-status-bar').slideUp();
                    
                    $('<div class="notice notice-success is-dismissible"><p>' + 
                      response.data.message + '</p></div>')
                        .hide()
                        .insertAfter('.wrap > h1')
                        .slideDown();
                        
                    $('input[type="submit"]').prop('disabled', false);
                } else {
                    alert(response.data.message || xautoposter.strings.error);
                }
            },
            error: function() {
                alert(xautoposter.strings.error);
            },
            complete: function() {
                $('#unlock-api-settings').prop('disabled', false);
            }
        });
    });

    // Manuel Paylaşım
    var $postsTable = $('.posts-table');
    if ($postsTable.length) {
        // Tüm Seç/Kaldır
        $('#select-all-posts').on('change', function() {
            var isChecked = $(this).prop('checked');
            $('input[name="posts[]"]:not(:disabled)').prop('checked', isChecked);
            updateShareButtonState();
        });

        // Tekil seçimleri izle
        $postsTable.on('change', 'input[name="posts[]"]', function() {
            updateShareButtonState();
        });

        // Paylaşım butonu durumunu güncelle
        function updateShareButtonState() {
            var checkedCount = $('input[name="posts[]"]:checked').length;
            $('#share-selected').prop('disabled', checkedCount === 0);
        }

        // Paylaşım işlemi
        $('#share-selected').on('click', function() {
            var posts = $('input[name="posts[]"]:checked').map(function() {
                return $(this).val();
            }).get();

            if (posts.length === 0) {
                alert(xautoposter.strings.no_posts_selected);
                return;
            }

            var $button = $(this);
            $button.prop('disabled', true).text(xautoposter.strings.sharing);

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'xautoposter_share_posts',
                    posts: posts,
                    nonce: xautoposter.nonce
                },
                success: function(response) {
                    if (response.success) {
                        alert(response.data.message);
                        location.reload();
                    } else {
                        alert(response.data.message || xautoposter.strings.error);
                    }
                },
                error: function() {
                    alert(xautoposter.strings.error);
                },
                complete: function() {
                    $button.prop('disabled', false)
                           .text(xautoposter.strings.share_selected);
                }
            });
        });

        // İlk yüklemede buton durumunu ayarla
        updateShareButtonState();
    }

    // Kategori Filtresi ve Sıralama
    $('#category-filter, #date-sort').on('change', function() {
        $(this).closest('form').submit();
    });
});