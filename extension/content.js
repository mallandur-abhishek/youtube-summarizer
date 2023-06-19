chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
        const summaryTag = document.getElementById("summary");
		if (summaryTag) summaryTag.remove();
		sendResponse();
	
        let [div, header] = ["div", "h4"].map(element => document.createElement(element));
        const { summary: { result: summary } = {} } = request || {};
        const breakTag = document.createElement("br");
		const infoDiv = document.getElementById("info");
		
        header.innerHTML="Summary generated by Summarizer: ";
        div.setAttribute("id", "summary");
		div.appendChild(header);
		div.appendChild(breakTag);
		div.appendChild(document.createTextNode(summary));
		infoDiv.appendChild(div);
    }
);