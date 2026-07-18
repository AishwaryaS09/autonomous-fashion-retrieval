"""
Reranking engine tests.

Covers:
  - text query inference for specific fashion queries
  - category filtering
  - image/sketch search without text attributes
  - top_k cap
  - candidate count computation
"""
import pytest
from app.core.reranking import (
    ReRankingEngine,
    compute_candidate_count,
    _extract_category,
    _extract_colors,
    _extract_patterns,
    _extract_styles,
    _extract_materials,
    _extract_occasions,
    _extract_gender,
)


# ── Fixtures ──────────────────────────────────────────────────────────────

@pytest.fixture
def engine():
    return ReRankingEngine()


def _make_product(pid: str, category: str, **attrs) -> dict:
    """Helper to build a fake catalog product dict."""
    p = {
        "id": pid,
        "name": attrs.get("name", f"Product {pid}"),
        "category": category,
        "color": attrs.get("color", ""),
        "pattern": attrs.get("pattern", ""),
        "style": attrs.get("style", ""),
        "material": attrs.get("material", ""),
        "occasion": attrs.get("occasion", ""),
        "gender": attrs.get("gender", ""),
        "similarity_score": attrs.get("similarity_score", 0.5),
    }
    return p


# ── Query attribute extraction ────────────────────────────────────────────

class TestQueryExtraction:
    def test_extract_category_plural(self):
        assert _extract_category("red floral dress") == "dresses"
        assert _extract_category("nice jacket") == "jackets"
        assert _extract_category("blue jeans") == "pants"

    def test_extract_category_synonyms(self):
        assert _extract_category("show me some sneakers") == "shoes"
        assert _extract_category("a nice handbag") == "bags"
        assert _extract_category("formal trousers") == "pants"
        assert _extract_category("cute blouse") == "shirts"

    def test_extract_colors_single(self):
        assert "red" in _extract_colors("red floral dress")
        assert "black" in _extract_colors("black leather jacket")
        assert "white" in _extract_colors("white sneakers")

    def test_extract_colors_multi_word(self):
        colors = _extract_colors("light blue oxford shirt")
        assert "light blue" in colors

    def test_extract_patterns(self):
        assert "floral" in _extract_patterns("red floral dress")
        assert "striped" in _extract_patterns("striped shirt")
        assert "plaid" in _extract_patterns("plaid flannel")

    def test_extract_styles(self):
        assert "casual" in _extract_styles("women's casual cotton shirt")
        assert "formal" in _extract_styles("formal leather shoes")

    def test_extract_materials(self):
        assert "cotton" in _extract_materials("women's casual cotton shirt")
        assert "leather" in _extract_materials("black leather jacket")
        assert "denim" in _extract_materials("denim jacket")

    def test_extract_occasions(self):
        assert "work" in _extract_occasions("office work shirt")
        assert "evening" in _extract_occasions("evening cocktail dress")

    def test_extract_gender(self):
        assert _extract_gender("women's casual cotton shirt") == "women"
        assert _extract_gender("men's formal trousers") == "men"


# ── Specific fashion queries ──────────────────────────────────────────────

class TestSpecificQueries:
    """Tests for the exact queries specified in the requirements."""

    def test_red_floral_dress(self, engine):
        products = [
            _make_product("d1", "dresses", name="Red Floral Summer Sundress",
                          color="red", pattern="floral", similarity_score=0.85),
            _make_product("d2", "dresses", name="Black Cocktail Midi Dress",
                          color="black", pattern="solid", similarity_score=0.80),
            _make_product("s1", "shirts", name="Red Plaid Flannel Shirt",
                          color="red", pattern="plaid", similarity_score=0.75),
        ]
        results = engine.rerank(products, query_text="red floral dress", top_k=3)
        # Category "dresses" is inferred from "dress" → cross-category items filtered
        assert len(results) == 2
        assert results[0]["id"] == "d1"
        assert all(r["category"] == "dresses" for r in results)

    def test_black_leather_jacket(self, engine):
        products = [
            _make_product("j1", "jackets", name="Black Faux Leather Biker Jacket",
                          color="black", material="faux leather", similarity_score=0.82),
            _make_product("j2", "jackets", name="Olive Green Bomber Jacket",
                          color="olive", material="nylon", similarity_score=0.80),
            _make_product("s1", "shoes", name="Black Leather Chelsea Boots",
                          color="black", material="leather", similarity_score=0.78),
        ]
        results = engine.rerank(products, query_text="black leather jacket", top_k=3)
        # Category "jackets" inferred → shoes filtered out
        assert len(results) == 2
        assert results[0]["id"] == "j1"
        assert all(r["category"] == "jackets" for r in results)

    def test_white_sneakers(self, engine):
        products = [
            _make_product("sh1", "shoes", name="White Low Top Canvas Sneakers",
                          color="white", style="casual", similarity_score=0.88),
            _make_product("sh2", "shoes", name="Black Leather Chelsea Boots",
                          color="black", style="smart", similarity_score=0.85),
            _make_product("sh3", "shoes", name="White Canvas Loafers",
                          color="white", style="smart casual", similarity_score=0.83),
        ]
        results = engine.rerank(products, query_text="white sneakers", top_k=3)
        assert len(results) == 3
        assert results[0]["id"] == "sh1"

    def test_white_sports_shoes(self, engine):
        products = [
            _make_product("sh1", "shoes", name="White Low Top Canvas Sneakers",
                          color="white", style="casual", similarity_score=0.85),
            _make_product("sh2", "shoes", name="Black Leather Chelsea Boots",
                          color="black", style="smart", similarity_score=0.80),
        ]
        results = engine.rerank(products, query_text="white sports shoes", top_k=2)
        assert len(results) == 2
        assert results[0]["id"] == "sh1"
        # "shoes" should infer category
        breakdown = results[0]["_score_breakdown"]
        assert breakdown["color"] > 0

    def test_womens_casual_cotton_shirt(self, engine):
        products = [
            _make_product("sr1", "shirts", name="Gray Crew Neck Graphic T-Shirt",
                          color="gray", style="casual", material="cotton",
                          gender="unisex", similarity_score=0.80),
            _make_product("sr2", "shirts", name="White Classic Polo Shirt",
                          color="white", style="preppy", material="cotton pique",
                          gender="unisex", similarity_score=0.78),
            _make_product("sr3", "shirts", name="Pink Striped Formal Dress Shirt",
                          color="pink", style="formal", material="cotton",
                          gender="men", similarity_score=0.76),
        ]
        results = engine.rerank(
            products, query_text="women's casual cotton shirt", top_k=3,
        )
        assert len(results) == 3
        # Casual cotton shirt should beat formal men's shirt
        for r in results:
            if r["id"] == "sr3":
                # sr3 should not be first because it's formal + men
                pass
        # sr1 (casual, cotton, unisex) or sr2 should rank higher than sr3
        ids_above_sr3 = [r["id"] for r in results]
        sr3_pos = ids_above_sr3.index("sr3")
        assert sr3_pos >= 1  # at least one item ranked above it


# ── Category filtering ────────────────────────────────────────────────────

class TestCategoryFiltering:
    def test_explicit_category_filter(self, engine):
        products = [
            _make_product("d1", "dresses", name="Red Dress",
                          color="red", similarity_score=0.90),
            _make_product("s1", "shoes", name="Red Shoes",
                          color="red", similarity_score=0.85),
            _make_product("j1", "jackets", name="Red Jacket",
                          color="red", similarity_score=0.80),
        ]
        results = engine.rerank(
            products, query_text="red", query_category="dresses", top_k=10,
        )
        assert len(results) == 1
        assert results[0]["category"] == "dresses"

    def test_category_inferred_from_text(self, engine):
        products = [
            _make_product("d1", "dresses", name="Floral Dress",
                          pattern="floral", similarity_score=0.85),
            _make_product("s1", "shirts", name="Floral Shirt",
                          pattern="floral", similarity_score=0.83),
        ]
        results = engine.rerank(products, query_text="floral dress", top_k=10)
        # Category "dresses" should be inferred, filtering to only dresses
        assert all(r["category"] == "dresses" for r in results)


# ── Image/sketch search (no text attributes) ─────────────────────────────

class TestImageSearchNoText:
    def test_scores_close_to_similarity(self, engine):
        """Without text, reranking_score should stay near similarity_score."""
        products = [
            _make_product("j1", "jackets", name="Biker Jacket",
                          color="black", similarity_score=0.90),
            _make_product("d1", "dresses", name="Summer Dress",
                          color="red", similarity_score=0.85),
        ]
        results = engine.rerank(products, top_k=10)
        for r in results:
            diff = abs(r["reranking_score"] - r["similarity_score"])
            assert diff < 0.05, (
                f"Product {r['id']}: reranking_score={r['reranking_score']} "
                f"vs similarity_score={r['similarity_score']}, diff={diff}"
            )

    def test_order_preserved_without_text(self, engine):
        """Without text the ranking should roughly follow similarity."""
        products = [
            _make_product("a", "shoes", name="Shoes A", similarity_score=0.95),
            _make_product("b", "shoes", name="Shoes B", similarity_score=0.90),
            _make_product("c", "shoes", name="Shoes C", similarity_score=0.85),
        ]
        results = engine.rerank(products, top_k=10)
        assert [r["id"] for r in results] == ["a", "b", "c"]


# ── top_k cap ─────────────────────────────────────────────────────────────

class TestTopKCap:
    def test_results_never_exceed_top_k(self, engine):
        products = [
            _make_product(f"p{i}", "shoes", name=f"Shoe {i}",
                          similarity_score=0.90 - i * 0.01)
            for i in range(30)
        ]
        results = engine.rerank(products, query_text="shoes", top_k=5)
        assert len(results) == 5

    def test_top_k_one(self, engine):
        products = [
            _make_product("a", "dresses", name="Dress A", similarity_score=0.95),
            _make_product("b", "dresses", name="Dress B", similarity_score=0.90),
        ]
        results = engine.rerank(products, query_text="dress", top_k=1)
        assert len(results) == 1

    def test_top_k_larger_than_candidates(self, engine):
        products = [
            _make_product("a", "bags", name="Bag A", similarity_score=0.90),
        ]
        results = engine.rerank(products, query_text="bag", top_k=10)
        assert len(results) == 1


# ── Candidate count computation ───────────────────────────────────────────

class TestCandidateCount:
    def test_basic(self):
        assert compute_candidate_count(10, 200) == 40  # 4 * 10

    def test_minimum_20(self):
        assert compute_candidate_count(3, 200) == 20

    def test_clamped_to_catalog_size(self):
        assert compute_candidate_count(10, 15) == 15

    def test_large_top_k(self):
        assert compute_candidate_count(50, 500) == 200  # 4 * 50

    def test_catalog_smaller_than_minimum(self):
        assert compute_candidate_count(5, 10) == 10


# ── Score breakdown ───────────────────────────────────────────────────────

class TestScoreBreakdown:
    def test_breakdown_present(self, engine):
        products = [
            _make_product("d1", "dresses", name="Red Floral Dress",
                          color="red", pattern="floral", similarity_score=0.85),
        ]
        results = engine.rerank(products, query_text="red floral dress", top_k=1)
        assert "_score_breakdown" in results[0]
        bd = results[0]["_score_breakdown"]
        assert "color" in bd
        assert "pattern" in bd
        assert "category" in bd
        assert "material" in bd
        assert "style" in bd
        assert "occasion" in bd
        assert "gender" in bd
        assert "keyword" in bd

    def test_color_breakdown_positive(self, engine):
        products = [
            _make_product("d1", "dresses", name="Red Dress",
                          color="red", similarity_score=0.85),
        ]
        results = engine.rerank(products, query_text="red dress", top_k=1)
        assert results[0]["_score_breakdown"]["color"] == 1.0

    def test_color_breakdown_zero_when_no_match(self, engine):
        products = [
            _make_product("d1", "dresses", name="Blue Dress",
                          color="blue", similarity_score=0.85),
        ]
        results = engine.rerank(products, query_text="red dress", top_k=1)
        assert results[0]["_score_breakdown"]["color"] == 0.0
