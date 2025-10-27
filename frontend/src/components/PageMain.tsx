import styled from "@emotion/styled";
import { BrowserRouter, Link, Routes, Route } from "react-router";
import { FaHome, FaMapMarkerAlt } from "react-icons/fa";

import TopPage from "./TopPage";
import UserPage from "./UserPage";

const Wrapper = styled.div`
  width: calc(100% - 64px);
  max-width: 800px;
  min-height: 100dvh;
  flex-shrink: 0;
  margin: 0 auto;
  padding: 16px 0 16px 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
  scroll-snap-align: start;
`;

const Header = styled.header`
  color: #999;
  font-size: 14px;
  margin: 0 0 24px 0;
  padding-bottom: 8px;
  border-bottom: solid 1px #eee;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;

  a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 4px;
    cursor: pointer;
    display: block;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Main = styled.div`
  flex: 1;
`;

const Footer = styled.footer`
  color: #999;
  font-size: 14px;
  margin: 24px 0 0 0;
  padding-top: 8px;
  border-top: solid 1px #eee;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;

  a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 4px;
    cursor: pointer;
    display: block;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Left = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
}
`;

const HomeLink = styled(Link)`
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const MapLink = styled.a`
  font-size: 16px;
  display: flex;
  align-items: center;
`;

interface PageMainProps {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  ref: React.RefObject<HTMLDivElement | null>;
}

const PageMain = ({ wrapperRef, ref }: PageMainProps) => {
  const scrollToTop = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <BrowserRouter>
      <Wrapper ref={ref}>
        <Header>
          <Left>
            <HomeLink to="/">
              <FaHome />
            </HomeLink>
            <a onClick={scrollToTop}>上スクロールで登録 ／ サインイン</a>
          </Left>
          <a href="https://github.com/hayatroid/ookayama-trap-show">
            GitHub ／ 使い方
          </a>
        </Header>
        <Main>
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/:screenName" element={<UserPage />} />
          </Routes>
        </Main>
        <Footer>
          <Right>
            <MapLink href="https://www.google.com/maps/dir/?api=1&origin=titech+museum&destination=tsukuba+amanogawa">
              <FaMapMarkerAlt />
            </MapLink>
            <a href="https://tsukuba.yokohama.dev">筑波大学 80km →</a>
          </Right>
        </Footer>
      </Wrapper>
    </BrowserRouter>
  );
};

export default PageMain;
