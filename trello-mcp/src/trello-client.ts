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
}
