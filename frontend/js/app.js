const API_BASE_URL = "http://127.0.0.1:8000";

const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");

const pageTitle = document.getElementById("page-title");
const pageDescription = document.getElementById("page-description");

const tabInfo = {
    analysis: {
        title: "AI 데이터 분석",
        description: "저장된 데이터를 기반으로 AI에게 질문하고 분석 결과를 확인하세요."
    },
    summary: {
        title: "데이터 요약",
        description: "저장된 시계열 데이터의 주요 통계를 확인합니다."
    },
    chart: {
        title: "데이터 추세",
        description: "날짜별 데이터 값의 변화를 확인합니다."
    },
    conversations: {
        title: "대화 기록",
        description: "AI와 나눈 분석 대화를 확인할 수 있습니다."
    },
    data: {
        title: "데이터 관리",
        description: "분석에 사용할 데이터를 추가하고 관리합니다."
    }
};

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const tabName = item.dataset.tab;

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        tabContents.forEach(tab => {
            tab.classList.remove("active");
        });

        item.classList.add("active");

        const targetTab = document.getElementById(
            `tab-${tabName}`
        );

        if (targetTab) {
            targetTab.classList.add("active");
        }

        if (tabInfo[tabName]) {
            pageTitle.textContent = tabInfo[tabName].title;
            pageDescription.textContent =
                tabInfo[tabName].description;
        }
        if (tabName === "summary") {
            loadSummary();
        }
    });
});

// ==============================
// AI 채팅
// ==============================

const providerInput = document.getElementById("provider");
const questionInput = document.getElementById("question");
const chatButton = document.getElementById("chat-button");
const chatLoading = document.getElementById("chat-loading");
const answerBox = document.getElementById("answer");


chatButton.addEventListener("click", async () => {
    const provider = providerInput.value;
    const question = questionInput.value.trim();

    if (!question) {
        alert("질문을 입력해주세요.");
        return;
    }

    chatButton.disabled = true;
    chatLoading.classList.remove("hidden");
    answerBox.textContent = "AI가 답변을 생성하고 있습니다...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                provider: provider,
                question: question
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "AI 답변 생성에 실패했습니다.");
        }

        answerBox.textContent = result.answer;

        // AI 답변이 생성된 후 데이터 요약도 새로 표시
        await loadSummary();

        // 대화 기록도 새로 불러오기
        await loadConversations();

    } catch (error) {
        answerBox.textContent = `오류가 발생했습니다.\n${error.message}`;
    } finally {
        chatButton.disabled = false;
        chatLoading.classList.add("hidden");
    }
});



// ==============================
// 데이터 요약
// ==============================

async function loadSummary() {
    const summaryBox = document.getElementById("summary");

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/data/summary`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터 요약을 불러오지 못했습니다."
            );
        }

        const trendClass =
            result.recent_trend === "상승"
                ? "trend-up"
                : result.recent_trend === "하락"
                    ? "trend-down"
                    : "trend-flat";

        const trendIcon =
            result.recent_trend === "상승"
                ? "↑"
                : result.recent_trend === "하락"
                    ? "↓"
                    : "→";

        summaryBox.innerHTML = `
            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">◷</span>
                    <span class="summary-label">분석 기간</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value period-value">
                        ${result.period.start}
                    </strong>

                    <span class="summary-divider">~</span>

                    <strong class="summary-value period-value">
                        ${result.period.end}
                    </strong>
                </div>

                <span class="summary-description">
                    전체 데이터 분석 기간
                </span>

            </div>


            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">▦</span>
                    <span class="summary-label">데이터 개수</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value">
                        ${result.count}
                    </strong>

                    <span class="summary-unit">
                        건
                    </span>
                </div>

                <span class="summary-description">
                    저장된 전체 데이터 수
                </span>

            </div>


            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">≈</span>
                    <span class="summary-label">평균값</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value">
                        ${result.statistics.average}
                    </strong>
                </div>

                <span class="summary-description">
                    전체 데이터의 평균
                </span>

            </div>


            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">↓</span>
                    <span class="summary-label">최솟값</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value">
                        ${result.statistics.minimum}
                    </strong>
                </div>

                <span class="summary-description">
                    기록된 가장 낮은 값
                </span>

            </div>


            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">↑</span>
                    <span class="summary-label">최댓값</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value">
                        ${result.statistics.maximum}
                    </strong>
                </div>

                <span class="summary-description">
                    기록된 가장 높은 값
                </span>

            </div>


            <div class="summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">↕</span>
                    <span class="summary-label">변동폭</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-value">
                        ${result.statistics.range}
                    </strong>
                </div>

                <span class="summary-description">
                    최댓값과 최솟값의 차이
                </span>

            </div>


            <div class="summary-card trend-summary-card">

                <div class="summary-card-header">
                    <span class="summary-icon">⌁</span>
                    <span class="summary-label">최근 추세</span>
                </div>

                <div class="summary-content">
                    <strong class="summary-trend ${trendClass}">
                        <span>${trendIcon}</span>
                        ${result.recent_trend}
                    </strong>
                </div>

                <span class="summary-description">
                    최근 데이터 기준 추세
                </span>

            </div>
        `;

    } catch (error) {
        summaryBox.innerHTML = `
            <div class="loading-card">
                <strong>데이터 요약을 불러오지 못했습니다.</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ==============================
// 초기 실행
// ==============================

loadSummary();

// ==============================
// 데이터 관리
// ==============================

const dataDateInput = document.getElementById("data-date");
const dataValueInput = document.getElementById("data-value");
const dataMemoInput = document.getElementById("data-memo");
const addDataButton = document.getElementById("add-data-button");
const dataList = document.getElementById("data-list");
const dataMessage = document.getElementById("data-message");

let allData = [];
let currentPage = 1;
let pageSize = 5;
let sortOrder = "desc";

const pageSizeSelect = document.getElementById("page-size");
const dataSortSelect = document.getElementById("data-sort");

const firstPageButton = document.getElementById("first-page-button");
const previousPageButton = document.getElementById("previous-page-button");
const nextPageButton = document.getElementById("next-page-button");
const lastPageButton = document.getElementById("last-page-button");

const pageInfo = document.getElementById("page-info");
const dataTotalCount = document.getElementById("data-total-count");


// 데이터 목록 불러오기
async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터를 불러오지 못했습니다."
            );
        }

        allData = result;
        dataTotalCount.textContent = allData.length;

        const totalPages = Math.max(
            1,
            Math.ceil(allData.length / pageSize)
        );

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        renderDataPage();
    } catch (error) {
        dataList.innerHTML = `
            <tr>
                <td colspan="4">
                    데이터를 불러오지 못했습니다.
                    ${error.message}
                </td>
            </tr>
        `;
    }
}

// 정렬 및 페이지에 맞는 데이터 출력
function renderDataPage() {
    if (allData.length === 0) {
        dataList.innerHTML = `
            <tr>
                <td colspan="4">
                    저장된 데이터가 없습니다.
                </td>
            </tr>
        `;

        pageInfo.textContent = "1 / 1";

        firstPageButton.disabled = true;
        previousPageButton.disabled = true;
        nextPageButton.disabled = true;
        lastPageButton.disabled = true;

        return;
    }

    const sortedData = [...allData].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (sortOrder === "asc") {
            return dateA - dateB;
        }

        return dateB - dateA;
    });

    const totalPages = Math.ceil(sortedData.length / pageSize);

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const pageData = sortedData.slice(startIndex, endIndex);

    dataList.innerHTML = pageData.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.value}</td>
            <td>${item.memo || ""}</td>
            <td>
                <button
                    class="data-action-button"
                    onclick="editData(
                        '${item.id}',
                        '${item.date}',
                        '${item.value}',
                        '${item.memo || ""}'
                    )"
                >
                    수정
                </button>

                <button
                    class="data-action-button"
                    onclick="deleteData('${item.id}')"
                >
                    삭제
                </button>
            </td>
        </tr>
    `).join("");

    pageInfo.textContent = `${currentPage} / ${totalPages}`;

    firstPageButton.disabled = currentPage === 1;
    previousPageButton.disabled = currentPage === 1;

    nextPageButton.disabled = currentPage === totalPages;
    lastPageButton.disabled = currentPage === totalPages;
}

// 페이지당 표시 개수 변경
pageSizeSelect.addEventListener(
    "change",
    () => {
        pageSize = Number(pageSizeSelect.value);
        currentPage = 1;

        renderDataPage();
    }
);

// 날짜 정렬 변경
dataSortSelect.addEventListener(
    "change",
    () => {
        sortOrder = dataSortSelect.value;
        currentPage = 1;

        renderDataPage();
    }
);

// 처음 페이지로 이동
firstPageButton.addEventListener(
    "click",
    () => {
        currentPage = 1;
        renderDataPage();
    }
);

// 이전 페이지로 이동
previousPageButton.addEventListener(
    "click",
    () => {
        if (currentPage > 1) {
            currentPage--;
            renderDataPage();
        }
    }
);

// 다음 페이지로 이동
nextPageButton.addEventListener(
    "click",
    () => {
        const totalPages = Math.ceil(
            allData.length / pageSize
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderDataPage();
        }
    }
);

// 마지막 페이지로 이동
lastPageButton.addEventListener(
    "click",
    () => {
        const totalPages = Math.max(
            1,
            Math.ceil(allData.length / pageSize)
        );

        currentPage = totalPages;
        renderDataPage();
    }
);

// 데이터 추가
addDataButton.addEventListener("click", async () => {
    const date = dataDateInput.value;
    const value = dataValueInput.value;
    const memo = dataMemoInput.value.trim();

    if (!date) {
        alert("날짜를 입력해주세요.");
        return;
    }

    if (value === "") {
        alert("값을 입력해주세요.");
        return;
    }

    addDataButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date: date,
                value: Number(value),
                memo: memo
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터 추가에 실패했습니다."
            );
        }

        dataMessage.textContent = "데이터가 추가되었습니다.";

        dataDateInput.value = "";
        dataValueInput.value = "";
        dataMemoInput.value = "";

        await loadData();
        await loadSummary();
        await loadChart();

    } catch (error) {
        dataMessage.textContent =
            `데이터 추가 실패: ${error.message}`;

    } finally {
        addDataButton.disabled = false;
    }
});


// 데이터 삭제
async function deleteData(dataId) {
    if (!confirm("이 데이터를 삭제하시겠습니까?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/data/${dataId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터 삭제에 실패했습니다."
            );
        }

        dataMessage.textContent = "데이터가 삭제되었습니다.";

        await loadData();
        await loadSummary();
        await loadChart();

    } catch (error) {
        dataMessage.textContent =
            `데이터 삭제 실패: ${error.message}`;
    }
}

async function editData(dataId, currentDate, currentValue, currentMemo) {
    const date = prompt(
        "날짜를 입력해주세요.",
        currentDate
    );

    if (date === null) {
        return;
    }

    const value = prompt(
        "값을 입력해주세요.",
        currentValue
    );

    if (value === null) {
        return;
    }

    const memo = prompt(
        "메모를 입력해주세요.",
        currentMemo
    );

    if (memo === null) {
        return;
    }

    if (!date.trim()) {
        alert("날짜를 입력해주세요.");
        return;
    }

    if (value.trim() === "" || isNaN(Number(value))) {
        alert("올바른 값을 입력해주세요.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/data/${dataId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: date.trim(),
                    value: Number(value),
                    memo: memo.trim()
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터 수정에 실패했습니다."
            );
        }

        dataMessage.textContent = "데이터가 수정되었습니다.";

        await loadData();
        await loadSummary();

    } catch (error) {
        dataMessage.textContent =
            `데이터 수정 실패: ${error.message}`;
    }
}

// 페이지가 열릴 때 데이터 목록 불러오기
loadData();

// ==============================
// 대화 기록
// ==============================

const loadConversationsButton = document.getElementById(
    "load-conversations-button"
);

const conversationList = document.getElementById(
    "conversation-list"
);

async function loadConversations() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/conversations`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "대화 기록을 불러오지 못했습니다."
            );
        }

        if (result.length === 0) {
            conversationList.innerHTML = `
                <p>저장된 대화가 없습니다.</p>
            `;
            return;
        }

        conversationList.innerHTML = result.map(conversation => {
            const provider = conversation.provider
                ? conversation.provider.toUpperCase()
                : "AI";

            const providerClass =
                conversation.provider === "openai"
                    ? "provider-openai"
                    : conversation.provider === "gemini"
                        ? "provider-gemini"
                        : "provider-default";

            const formattedDate = conversation.created_at
                ? new Date(conversation.created_at).toLocaleString(
                    "ko-KR",
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "날짜 정보 없음";

            const messages = conversation.messages || [];

            const userMessage = messages.find(
                message => message.role === "user"
            );

            const assistantMessage = messages.find(
                message => message.role === "assistant"
            );

            const question = userMessage
                ? userMessage.content
                : "질문 내용이 없습니다.";

            const answer = assistantMessage
                ? assistantMessage.content
                : "답변 내용이 없습니다.";

            return `
                <div
                    class="conversation-item"
                    data-conversation-id="${conversation.id}"
                    onclick="toggleConversation('${conversation.id}')"
                >
                    <div class="conversation-item-header">
                        <div class="conversation-title-area">
                            <strong>${conversation.title}</strong>
                            <small>${formattedDate}</small>
                        </div>

                        <span class="provider-badge ${providerClass}">
                            ${provider}
                        </span>
                    </div>

                    <div
                        id="conversation-detail-${conversation.id}"
                        class="conversation-detail hidden"
                    >
                        <div class="conversation-question">
                            <strong>질문</strong>
                            <p>${question}</p>
                        </div>

                        <div class="conversation-answer">
                            <strong>답변</strong>
                            <p>${answer}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        conversationList.innerHTML = `
            <p>
                대화 기록을 불러오지 못했습니다.
                ${error.message}
            </p>
        `;
    }
}

loadConversationsButton.addEventListener(
    "click",
    loadConversations
);

function toggleConversation(conversationId) {
    const detail = document.getElementById(
        `conversation-detail-${conversationId}`
    );

    const conversationItem = document.querySelector(
        `[data-conversation-id="${conversationId}"]`
    );

    if (!detail || !conversationItem) {
        return;
    }

    const isOpening = detail.classList.contains("hidden");

    // 모든 대화 기록 닫기
    document.querySelectorAll(".conversation-detail").forEach((item) => {
        item.classList.add("hidden");
    });

    // 모든 선택 상태 제거
    document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("selected");
    });

    // 선택한 대화 열기
    if (isOpening) {
        detail.classList.remove("hidden");
        conversationItem.classList.add("selected");
    }
}

async function loadConversation(conversationId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/conversations/${conversationId}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "대화를 불러오지 못했습니다."
            );
        }

        if (!result.messages || result.messages.length === 0) {
            answerBox.textContent = "대화 내용이 없습니다.";
            return;
        }

        const messages = result.messages
            .map(message => {
                const role =
                    message.role === "user"
                        ? "사용자"
                        : "AI";

                return `${role}:\n${message.content}`;
            })
            .join("\n\n");

        answerBox.textContent = messages;

    } catch (error) {
        answerBox.textContent =
            `대화를 불러오지 못했습니다.\n${error.message}`;
    }
}

/* 차트 그래프 생성 */

let dataChart = null;

async function loadChart() {
    const chartCanvas = document.getElementById("data-chart");

    try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "그래프 데이터를 불러오지 못했습니다."
            );
        }

        const labels = result.map(item => item.date);
        const values = result.map(item => item.value);

        if (dataChart) {
            dataChart.destroy();
        }

        dataChart = new Chart(chartCanvas, {
            type: "line",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "데이터 값",
                        data: values,

                        borderWidth: 2,
                        tension: 0.35,

                        pointRadius: 0,
                        pointHoverRadius: 5,

                        fill: true,

                        backgroundColor: "rgba(59, 130, 246, 0.08)",
                        borderColor: "#3b82f6",

                        pointBackgroundColor: "#3b82f6",
                        pointBorderWidth: 0
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        padding: 12,

                        displayColors: false,

                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },

                            label: function(context) {
                                return `값: ${context.parsed.y}`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            maxTicksLimit: window.innerWidth <= 768 ? 5 : 6,

                            maxRotation: window.innerWidth <= 768 ? 60 : 0,
                            minRotation: window.innerWidth <= 768 ? 60 : 0,

                            callback: function(value) {
                                const label = this.getLabelForValue(value);

                                if (!label) {
                                    return "";
                                }

                                return label;
                            }
                        },

                        border: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,

                        grid: {
                            color: "rgba(148, 163, 184, 0.15)"
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            padding: 10
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error(
            "그래프를 불러오지 못했습니다:",
            error
        );
    }
}

window.addEventListener("resize", () => {
    if (!dataChart) {
        return;
    }

    const isMobile = window.innerWidth <= 768;

    dataChart.options.scales.x.ticks.maxTicksLimit =
        isMobile ? 5 : 6;

    dataChart.options.scales.x.ticks.maxRotation =
        isMobile ? 35 : 0;

    dataChart.options.scales.x.ticks.minRotation =
        isMobile ? 35 : 0;

    dataChart.update("none");
});

loadChart();

/* CSV 다운로드 */

const exportCsvButton = document.getElementById(
    "export-csv-button"
);

exportCsvButton.addEventListener("click", async () => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/data`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "데이터를 불러오지 못했습니다."
            );
        }

        if (result.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const csvRows = [
            ["날짜", "값", "메모"],
            ...result.map(item => [
                item.date,
                item.value,
                item.memo
            ])
        ];

        const csv = "\uFEFF" + csvRows
            .map(row =>
                row
                    .map(value =>
                        `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "ai-data.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    } catch (error) {
        alert(
            `CSV 다운로드에 실패했습니다.\n${error.message}`
        );
    }
});

/* ================================= */
/* 다크 모드 */
/* ================================= */

const darkModeToggle = document.getElementById(
    "dark-mode-toggle"
);

const floatingDarkModeToggle = document.getElementById(
    "floating-dark-mode-toggle"
);

// 다크모드 버튼 텍스트 및 아이콘 업데이트
function updateDarkModeButton() {
    const isDarkMode =
        document.body.classList.contains("dark-mode");

    if (darkModeToggle) {
        darkModeToggle.textContent = isDarkMode
            ? "라이트 모드"
            : "다크 모드";
    }

    if (floatingDarkModeToggle) {
        floatingDarkModeToggle.textContent = isDarkMode
            ? "☀"
            : "◐";

        floatingDarkModeToggle.setAttribute(
            "aria-label",
            isDarkMode
                ? "라이트모드로 전환"
                : "다크모드로 전환"
        );

        floatingDarkModeToggle.setAttribute(
            "title",
            isDarkMode
                ? "라이트모드로 전환"
                : "다크모드로 전환"
        );
    }
}

// 저장된 다크모드 설정 불러오기
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
}

updateDarkModeButton();

// 실제 다크모드 전환 함수
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "darkMode",
        isDarkMode ? "enabled" : "disabled"
    );

    updateDarkModeButton();
}

// PC 사이드바 다크모드 버튼
if (darkModeToggle) {
    darkModeToggle.addEventListener(
        "click",
        toggleDarkMode
    );
}

// 모바일 Floating 다크모드 버튼
if (floatingDarkModeToggle) {
    floatingDarkModeToggle.addEventListener(
        "click",
        toggleDarkMode
    );
}