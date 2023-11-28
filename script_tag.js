const inquiryForm = document.getElementById("formContactUs");
const originalForm = inquiryForm.innerHTML;
const LABEL_TRANSLATIONS = {
	school_id: "お問い合わせ先",
	parent_name: " 保護者のお名前",
	phone: "電話番号",
	email: "Email",
	child_name: "お子様のお名前",
	child_birthday: "お子様の生年月日",
	kindy: "保育園・幼稚園名と在園状況 ",
	ele_school: "小学校名と在学状況 ",
	requests: "本文",
};
const SCHOOL_NAME_HASH = {
	3: "KidsUP田園調布雪谷校",
	4: "KidsUP蒲田駅前校",
	5: "KidsUP池上校",
	6: "KidsUP東陽町校",
	7: "KidsUP長原校",
	8: "KidsUP門前仲町校",
	9: "KidsUP戸越校",
	10: "KidsUP成城校",
	11: "KidsUP大森校",
	12: "KidsUP早稲田校",
	13: "KidsUPりんかい東雲校",
	14: "KidsUP新川崎校",
	15: "KidsUP等々力校",
	16: "KidsUP大島校",
	17: "KidsUP三鷹校",
	18: "KidsUP二俣川校",
	19: "KidsUP新浦安校",
	20: "KidsUP天王町校",
	21: "KidsUP南町田グランベリーパーク校",
	22: "KidsUP大井校",
	23: "KidsUP晴海校",
	24: "KidsUP四谷校",
	25: "KidsUP赤羽校",
	26: "KidsUP北品川校",
	27: "KidsUP溝の口校",
	28: "KidsUP矢向校",
	29: "KidsUPソコラ南行徳校",
	30: "KidsUP鷺宮校",
	31: "KidsUP馬込校",
	32: "KidsUP大倉山校",
	33: "KidsUP武蔵新城校",
	34: "KidsUP武蔵小杉校",
	35: "KidsUP川口校",
	36: "KidsUP池袋校",
};

inquiryForm.addEventListener("submit", function showSummary(e) {
	e.preventDefault();
	inquiryForm.removeEventListener("submit", showSummary);
	getFormData(e);
});

function getFormData(e) {
	const data = new FormData(e.target);
	const inquiryObject = Object.fromEntries(data);
	createSummary(inquiryObject);
}

function createSummary(inquiry) {
	inquiryForm.innerHTML = "";
	inquiryForm.append(...createSummaryHeadings());
	Object.entries(inquiry)
		.filter((pair) => pair[0] !== "category")
		.forEach((pair) => {
			inquiryForm.appendChild(createSummaryField(pair));
		});
	inquiryForm.appendChild(createButtonContainer(inquiry));
	window.location.replace("#pagetop", "");
}

function createSummaryHeadings() {
	const heading = document.createElement("h2");
	heading.innerText = "お問い合わせ内容の確認";
	heading.classList.add("summary-heading");

	const message = document.createElement("p");
	message.classList.add("kids-sub");
	message.innerText = "お問い合わせ内容をご確認下さい。";
	message.classList.add("summary-heading");

	return [heading, message];
}

function createSummaryField(pair) {
	const fieldContainer = document.createElement("div");

	const label = document.createElement("label");
	label.innerText = LABEL_TRANSLATIONS[pair[0]];

	const value = document.createElement("p");
	value.innerText = SCHOOL_NAME_HASH[pair[1]] || pair[1] || "なし";

	fieldContainer.append(label, value);
	fieldContainer.classList.add("form-group");
	if (pair[0] == "requests") {
		fieldContainer.style.flexGrow = "1";
		fieldContainer.style.marginLeft = "3%";
	}
	return fieldContainer;
}

function createButtonContainer(inquiry) {
	const container = document.createElement("div");
	container.style.display = "flex";
	container.style.flexDirection = "column";
	container.style.alignItems = "center";
	container.style.gap = "0.5rem";
	container.style.width = "100%";
	container.appendChild(createBackButton(inquiry));
	container.appendChild(createSubmitButton(inquiry));
	return container;
}

function createBackButton(inquiry) {
	const button = document.createElement("button");
	button.id = "btnBack";
	button.type = "submit";
	button.innerText = "戻る";
	button.addEventListener("click", function showForm(e) {
		e.preventDefault();
		inquiryForm.innerHTML = originalForm;
		Object.entries(inquiry).forEach((pair) => {
			const input = document.getElementById(pair[0]);
			if (input.type === "select") {
				const optGroups = input.children;
				[...optGroups].forEach((group) => {
					const selected = group.find((o) => o.value === pair[1]);
					if (selected) selected.selected = pair[1];
				});
			} else {
				input.value = pair[1];
			}
		});
		inquiryForm.addEventListener("submit", function showSummary(e) {
			e.preventDefault();
			inquiryForm.removeEventListener("submit", showSummary);
			getFormData(e);
		});
	});
	return button;
}

function createSubmitButton(inquiry) {
	const button = document.createElement("button");
	button.id = "btnContactUs";
	button.type = "submit";
	button.innerText = "送信する";
	button.classList.add("btn", "btn-primary", "btn-md");
	button.style.textAlign = "center";
	button.addEventListener("click", async (e) => {
		e.preventDefault();
		response = await sendInquiry(inquiry);
		if (response.status === 200) {
			document.location = "https://kids-up.jp/inquiry/complete/";
		} else {
			inquiryForm.innerHTML = "";
			inquiryForm.appendChild(createErrorMessage());
		}
	});
	return button;
}

function createErrorMessage() {
	const message = document.createElement("h1");
	message.innerText = "お問い合わせは送信できませんでした。";
	return message;
}

async function sendInquiry(inquiry) {
	const headers = new Headers({
		"Content-Type": "application/json",
	});

	const response = await fetch("https://kids-up.app/create_inquiry.json", {
		method: "POST",
		headers: headers,
		body: JSON.stringify({ inquiry: inquiry }),
	});
	return response;
}
