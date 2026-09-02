import axios from "axios";

// ─────────────────────────────────────────────
// 케이스 1: 본문 추출이 없는 함수 — async/await 제거 가능
// ─────────────────────────────────────────────

// 변경 전
const getGroupDetailBefore = async (id: string) => {
  return await axios.get(`/api/groups/${id}`);
};

// 변경 후 — Promise를 그대로 반환하므로 반환 형태가 동일함
const getGroupDetailAfter = (id: string) => {
  return axios.get(`/api/groups/${id}`);
};

// ─────────────────────────────────────────────
// 케이스 2: 본문 추출이 있는 함수 — 단순 제거하면 깨짐
// ─────────────────────────────────────────────

// ❌ 위험한 변경: await만 제거하면 반환 형태가 바뀜
const getGroupListUnsafe = (): Promise<Group[]> => {
  // await 없이 .then 체인도 없어서, 실제로는
  // Promise<AxiosResponse>를 반환하게 되어 호출부가 깨짐
  return axios.get("/api/groups").data.data; // 타입 에러 + 런타임 에러
};

// ✅ 컨벤션에 맞추려면: 가공을 훅으로 옮기고 호출부도 함께 수정해야 함
const getGroupList = () => {
  return axios.get("/api/groups"); // API 함수는 요청만
};

const useGroupList = () => {
  return useQuery({
    queryKey: ["groupList"],
    queryFn: async () => {
      const res = await getGroupList();
      return res.data.data; // 가공은 훅의 책임
    },
  });
};

// 이 변경을 적용하려면, 기존에 getGroupList()를 직접 호출해서
// res.data.data 형태로 값을 바로 쓰던 다른 모든 호출부도
// 함께 찾아 고쳐야 함 — 그래서 파급 범위가 작은 함수부터 우선 적용
