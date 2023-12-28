const inquiryForm = document.getElementById("formContactUs");

// Fetch the current list of schools from Seasonal Site API

async function getSchools() {
  const response = await fetch("https://kids-up.app/schools");
  const data = await response.json();

  return data.map((school) => {
    return {
      id: school.id,
      name: `Kids UP ${school.name}`,
    };
  });
}

async function createSchoolsDropdown() {
  const schools = await getSchools();

  const formGroup = document.getElementById("school-form-group");
  formGroup.classList.add("form-group");
  const select = document.createElement("select");
  select.id = "school_id";
  select.name = "school_id";
  select.required = "required";

  const defaultOption = document.createElement("option");
  defaultOption.innerText = "選択してください";
  defaultOption.value = "";
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  schools.forEach((school) => {
    const option = document.createElement("option");
    option.value = school.id;
    option.innerText = school.name;
    select.appendChild(option);
  });

  select.classList.add("form-control");
  formGroup.appendChild(select);
}

createSchoolsDropdown();

function addModalListeners() {
  const privacyCheck = document.getElementById("privacy");

  privacyCheck.addEventListener("change", function (e) {
    const submitButton = document.getElementById("btnContactUs");

    if (e.target.checked) {
      submitButton.disabled = false;
      submitButton.innerText = "個人情報保護方針に同意する";
    } else {
      submitButton.disabled = true;
      submitButton.innerText = "個人情報保護方針に同意の上、次へお進みください";
    }
  });

  const privacyModal = document.getElementById("modalPrivacyPolicy");

  const closeModalButtons = document.querySelectorAll(".close-modal");
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      privacyModal.close();
    });
  });

  const privacyModalButton = document.getElementById("privacyModalButton");

  privacyModalButton.addEventListener("click", () => {
    privacyModal.showModal();
  });
}

addModalListeners();

const originalForm = inquiryForm.innerHTML;

const LABEL_TRANSLATIONS = {
  school_id: "お問い合わせ先のスクールをお選びください",
  parent_name: " 保護者のお名前",
  phone: "電話番号",
  email: "Eメール",
  child_name: "お子様のお名前",
  child_birthday: "お子様の生年月日",
  kindy: "保育園・幼稚園名と在園状況 ",
  ele_school: "小学校名と在学状況 ",
  requests: "お問い合わせ内容",
};

inquiryForm.addEventListener("submit", function showSummary(e) {
  e.preventDefault();
  inquiryForm.removeEventListener("submit", showSummary);
  getFormData(e);
});

function getFormData(e) {
  const data = new FormData(e.target);
  const inquiryObject = Object.fromEntries(data);
  const schoolSelect = document.getElementById("school_id");
  const selectedSchool =
    schoolSelect.options[schoolSelect.selectedIndex].innerText;

  createSummary(inquiryObject, selectedSchool);
}

function createSummary(inquiry, selectedSchool) {
  inquiryForm.innerHTML = "";
  inquiryForm.append(...createSummaryHeadings());
  Object.entries(inquiry)
    .filter((pair) => pair[0] !== "category" && pair[0] !== "privacy")
    .forEach((pair) => {
      if (pair[0] === "school_id") {
        pair[1] = selectedSchool;
      }
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
  value.innerText = pair[1] || "なし";

  fieldContainer.append(label, value);
  fieldContainer.classList.add("form-group");
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
  button.classList.add("btn-secondary");
  button.type = "submit";
  button.innerText = "戻る";
  button.addEventListener("click", async function showForm(e) {
    e.preventDefault();
    inquiryForm.innerHTML = originalForm;
    await createSchoolsDropdown();
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
    addModalListeners();
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
