$(function() {
    console.log(`Chain Consolidated Report Tool - Script Loaded!`);

    // FIELDS
    const consolidatedFile = $("#consolidated-file");
    const selectProcess = $('#select-process');
    const selectChain = $("#select-chain");
    const selectMonth = $("#select-month");
    const inputYear = $("#input-year");
    inputYear.val((new Date().getFullYear()));

    // BUTTONS
    const onProcessButton = $('#app-process');
    onProcessButton.attr('disabled', true);

    const onExitButton = $('#app-exit');

    // ALERT
    const alertSection = $('#validation-alert');

    // SECTIONS
    const fileSection = $(".file-section");
    const filterSection = $(".filter-section");
    filterSection.hide();

    // VALIDATE
    function validate() {
        if (selectProcess.val() === "LOAD") {
            const fields = [
                consolidatedFile.val().length,
                selectProcess.val().length
            ];
    
            return fields.map((field) => { return (field > 1) ? true : false; }).every(f => f === true);

        } else {
            const fields = [
                selectChain.val().length,
                selectMonth.val().length,
                inputYear.val().length
            ]
            return true;
        }
    }

    consolidatedFile.on("change", function(event) {
        try {
            const input = event.target;
            const file = input.files[0];
            const extension = file.name.split(".")[1];
            const allValid = validate();
            onProcessButton.attr('disabled', (extension !== 'xlsx' || !allValid) ? true : false);

            if (extension !== 'xlsx') {
                alertSection.removeClass("d-none").addClass("bg-danger").text("ERROR: Invalid spreadsheet file.");
            } else {
                alertSection.addClass("d-none").text("");
            }

        } catch (error) {
            onProcessButton.attr('disabled', true);
        }
    });

    selectProcess.on("change", function() {
        switch($(this).val()) {
            case "LOAD":
                alertSection.addClass("d-none");
                const allValid = validate();
                onProcessButton.attr("disabled", (!allValid) ? true : false);
    
                fileSection.show();
                consolidatedFile.val("");

                filterSection.hide();
                selectChain.val("");
                selectMonth.val("");
                break;

            case "PURGE":
                alertSection.addClass("d-none");
                onProcessButton.attr("disabled", false);
                fileSection.hide();
                filterSection.show();
                consolidatedFile.val("");
                break;

            default:
                alertSection.addClass("d-none");
                fileSection.show();
                filterSection.hide();
                consolidatedFile.val("");
                selectChain.val("");
                selectMonth.val("");
        }
    });

    onProcessButton.on("click", async function() {
        try {
            alertSection.addClass("d-none");

            const endpoint = (selectProcess.val() === 'LOAD') ? 'load' : 'purge';
            const payload = {
                consolidatedFile: consolidatedFile.val(),
                action: selectProcess.val()
            };

            $.ajax({
                method: 'POST',
                url: `http://localhost:5555/${endpoint}`,                
                data: payload,
                beforeSend: function() {
                    onExitButton.attr("disabled", true);
                    $(this).attr("disabled", true).html(`<div class="spinner-border spinner-border-sm text-light" role="status">
                                 <span class="visually-hidden">Loading...</span></div> Processing...`);                    
                },
                success: function(data, status) {
                    console.log(status)
                    console.log(data);
                    const { msg } = data;
                    console.log(msg);

                    alertSection.removeClass("d-none bg-danger");

                    const alertCss = (status === "success") ? "bg-success" : "bg-danger";
                    alertSection.addClass(alertCss).text(msg);

                    $(this).html("Process").attr("disabled", false);
                    onExitButton.attr("disabled", false);
                }
            });
            
        } catch (error) {
            alertSection.removeClass("d-none").addClass("bg-danger").text(`ERROR: ${error}`);
        }
    });

    onExitButton.on("click", function() {
        console.log(`Closing App...`);
        window.electronAPI.closeWindow();
    });
});