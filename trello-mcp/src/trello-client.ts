const TRELLO_API_BASE = "https://api.trello.com/1";

export interface TrelloConfig {
  apiKey: string;
  token: string;
}

export interface Board {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
}

export interface List {
  id: string;
  name: string;
  idBoard: string;
  closed: boolean;
  pos: number;
}

export interface Card {
  id: string;
  name: string;
  desc: string;
  idList: string;
  idBoard: string;
  url: string;
  closed: boolean;
  due: string | null;
  dueComplete: boolean;
  labels: Label[];
  pos: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface CheckItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  pos: number;
  idChecklist: string;
}

export interface Checklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  checkItems: CheckItem[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  bytes: number;
  date: string;
  isUpload: boolean;
}

export interface CustomField {
  id: string;
  idModel: string;
  modelType: string;
  fieldGroup: string;
  name: string;
  type: "number" | "text" | "date" | "checkbox" | "list";
  options?: CustomFieldOption[];
  pos: number;
}

export interface CustomFieldOption {
  id: string;
  idCustomField: string;
  value: { text: string };
  color: string;
  pos: number;
}

export interface CustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  modelType: string;
  value: {
    number?: string;
    text?: string;
    date?: string;
    checked?: string;
    idValue?: string;
  };
}

export class TrelloClient {
  private apiKey: string;
  private token: string;

  constructor(config: TrelloConfig) {
    this.apiKey = config.apiKey;
    this.token = config.token;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${TRELLO_API_BASE}${endpoint}`);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("token", this.token);

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    } else if (body && method === "GET") {
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Trello API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // Board operations
  async getBoards(): Promise<Board[]> {
    return this.request<Board[]>("GET", "/members/me/boards", {
      filter: "open",
      fields: "id,name,desc,url,closed",
    });
  }

  async getBoard(boardId: string): Promise<Board> {
    return this.request<Board>("GET", `/boards/${boardId}`);
  }

  async createBoard(name: string, desc?: string): Promise<Board> {
    return this.request<Board>("POST", "/boards", { name, desc });
  }

  async updateBoard(
    boardId: string,
    updates: { name?: string; desc?: string; closed?: boolean }
  ): Promise<Board> {
    return this.request<Board>("PUT", `/boards/${boardId}`, updates);
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.request<void>("DELETE", `/boards/${boardId}`);
  }

  // List operations
  async getLists(boardId: string): Promise<List[]> {
    return this.request<List[]>("GET", `/boards/${boardId}/lists`, {
      filter: "open",
    });
  }

  async createList(boardId: string, name: string, pos?: string): Promise<List> {
    return this.request<List>("POST", "/lists", {
      name,
      idBoard: boardId,
      pos: pos || "bottom",
    });
  }

  async updateList(
    listId: string,
    updates: { name?: string; closed?: boolean; pos?: string }
  ): Promise<List> {
    return this.request<List>("PUT", `/lists/${listId}`, updates);
  }

  async archiveList(listId: string): Promise<List> {
    return this.request<List>("PUT", `/lists/${listId}/closed`, {
      value: true,
    });
  }

  // Card operations
  async getCards(listId: string): Promise<Card[]> {
    return this.request<Card[]>("GET", `/lists/${listId}/cards`);
  }

  async getBoardCards(boardId: string): Promise<Card[]> {
    return this.request<Card[]>("GET", `/boards/${boardId}/cards`);
  }

  async getCard(cardId: string): Promise<Card> {
    return this.request<Card>("GET", `/cards/${cardId}`);
  }

  async createCard(
    listId: string,
    name: string,
    options?: {
      desc?: string;
      due?: string;
      pos?: string;
      idLabels?: string[];
    }
  ): Promise<Card> {
    return this.request<Card>("POST", "/cards", {
      idList: listId,
      name,
      ...options,
    });
  }

  async updateCard(
    cardId: string,
    updates: {
      name?: string;
      desc?: string;
      due?: string | null;
      dueComplete?: boolean;
      idList?: string;
      pos?: string;
      closed?: boolean;
    }
  ): Promise<Card> {
    return this.request<Card>("PUT", `/cards/${cardId}`, updates);
  }

  async moveCard(cardId: string, listId: string, pos?: string): Promise<Card> {
    return this.request<Card>("PUT", `/cards/${cardId}`, {
      idList: listId,
      pos: pos || "bottom",
    });
  }

  async archiveCard(cardId: string): Promise<Card> {
    return this.request<Card>("PUT", `/cards/${cardId}`, { closed: true });
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.request<void>("DELETE", `/cards/${cardId}`);
  }

  // Search
  async searchCards(
    query: string,
    options?: { boardId?: string; limit?: number }
  ): Promise<{ cards: Card[] }> {
    return this.request<{ cards: Card[] }>("GET", "/search", {
      query,
      modelTypes: "cards",
      cards_limit: options?.limit || 10,
      idBoards: options?.boardId,
    });
  }

  // Labels
  async getBoardLabels(boardId: string): Promise<Label[]> {
    return this.request<Label[]>("GET", `/boards/${boardId}/labels`);
  }

  async addLabelToCard(cardId: string, labelId: string): Promise<void> {
    await this.request<void>("POST", `/cards/${cardId}/idLabels`, {
      value: labelId,
    });
  }

  async removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/cards/${cardId}/idLabels/${labelId}`
    );
  }

  // Checklists
  async getCardChecklists(cardId: string): Promise<Checklist[]> {
    return this.request<Checklist[]>("GET", `/cards/${cardId}/checklists`);
  }

  async getChecklist(checklistId: string): Promise<Checklist> {
    return this.request<Checklist>("GET", `/checklists/${checklistId}`);
  }

  async updateCheckItem(
    cardId: string,
    checkItemId: string,
    updates: { name?: string; state?: "complete" | "incomplete" }
  ): Promise<CheckItem> {
    return this.request<CheckItem>(
      "PUT",
      `/cards/${cardId}/checkItem/${checkItemId}`,
      updates
    );
  }

  // Attachments
  async getCardAttachments(cardId: string): Promise<Attachment[]> {
    return this.request<Attachment[]>("GET", `/cards/${cardId}/attachments`);
  }

  // Custom Fields
  async getBoardCustomFields(boardId: string): Promise<CustomField[]> {
    return this.request<CustomField[]>("GET", `/boards/${boardId}/customFields`);
  }

  async getCardCustomFieldItems(cardId: string): Promise<CustomFieldItem[]> {
    return this.request<CustomFieldItem[]>(
      "GET",
      `/cards/${cardId}/customFieldItems`
    );
  }

  async updateCardCustomField(
    cardId: string,
    customFieldId: string,
    value: { number?: string; text?: string; date?: string; checked?: string; idValue?: string }
  ): Promise<CustomFieldItem> {
    return this.request<CustomFieldItem>(
      "PUT",
      `/cards/${cardId}/customField/${customFieldId}/item`,
      { value }
    );
  }

  async clearCardCustomField(
    cardId: string,
    customFieldId: string
  ): Promise<CustomFieldItem> {
    return this.request<CustomFieldItem>(
      "PUT",
      `/cards/${cardId}/customField/${customFieldId}/item`,
      { value: "" }
    );
  }

  // Convenience method to find Estimate field on a board
  async findEstimateField(boardId: string): Promise<CustomField | undefined> {
    const fields = await this.getBoardCustomFields(boardId);
    return fields.find(
      (f) => f.name.toLowerCase() === "estimate" && f.type === "number"
    );
  }

  // Get Estimate (story points) for a card
  async getCardEstimate(
    cardId: string,
    boardId: string
  ): Promise<number | null> {
    const estimateField = await this.findEstimateField(boardId);
    if (!estimateField) {
      return null;
    }

    const customFieldItems = await this.getCardCustomFieldItems(cardId);
    const estimateItem = customFieldItems.find(
      (item) => item.idCustomField === estimateField.id
    );

    if (!estimateItem || !estimateItem.value.number) {
      return null;
    }

    return parseFloat(estimateItem.value.number);
  }

  // Set Estimate (story points) for a card
  async setCardEstimate(
    cardId: string,
    boardId: string,
    hours: number
  ): Promise<CustomFieldItem | null> {
    const estimateField = await this.findEstimateField(boardId);
    if (!estimateField) {
      throw new Error("Estimate custom field not found on this board");
    }

    return this.updateCardCustomField(cardId, estimateField.id, {
      number: hours.toString(),
    });
  }
}
